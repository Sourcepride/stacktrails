import { appFetch } from "@/lib/appFetch";
import { BackendRoutes } from "@/routes";
import { useUploads } from "./useUploads";

export const useUploadToDropbox = (defaultFolder = "") => {
  const ctx = useUploads();

  return async ({
    files,
    concurrency = 3,
    folderPath = defaultFolder || "",
  }: {
    files: File[];
    concurrency?: number;
    folderPath?: string;
  }) => {
    const res = await batchUploadDropbox(ctx, files, concurrency, folderPath);
    // Prefer filePath if present, otherwise fileId
    const url = await Promise.all(
      res.map((d) => makeFilePublicDropbox(d.filePath ?? (d.fileId as string)))
    );

    return url;
  };
};

export default useUploadToDropbox;

// ---------- constants ----------
const DROPBOX_CONTENT_API = "https://content.dropboxapi.com/2/files";
const DROPBOX_API = "https://api.dropboxapi.com/2/files";
const SIMPLE_UPLOAD_LIMIT = 150 * 1024 * 1024; // 150 MB

// ---------- simple upload using XHR so we can track progress ----------
function uploadSimpleFileDropboxXHR(
  ctx: globalUploadStateT,
  jobId: string,
  accessToken: string,
  file: File,
  path: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${DROPBOX_CONTENT_API}/upload`);

    xhr.setRequestHeader("Authorization", `Bearer ${accessToken}`);
    xhr.setRequestHeader("Content-Type", "application/octet-stream");
    xhr.setRequestHeader(
      "Dropbox-API-Arg",
      JSON.stringify({ path, mode: "add", autorename: true, mute: false })
    );

    // progress events
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        ctx.updateJob(jobId, { progress: percent, status: "uploading" });
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          ctx.updateJob(jobId, { progress: 100, status: "completed" });
          // remove after 5s
          setTimeout(() => ctx.removeJob(jobId), 5000);
          resolve(json);
        } catch (err) {
          ctx.updateJob(jobId, { status: "failed" });
          setTimeout(() => ctx.removeJob(jobId), 5000);
          reject(err);
        }
      } else {
        ctx.updateJob(jobId, { status: "failed" });
        setTimeout(() => ctx.removeJob(jobId), 5000);
        reject({ status: xhr.status, message: xhr.responseText });
      }
    };

    xhr.onerror = () => {
      ctx.updateJob(jobId, { status: "failed" });
      setTimeout(() => ctx.removeJob(jobId), 5000);
      reject(new Error("Network error during Dropbox simple upload"));
    };

    // attach cancel function
    ctx.updateJob(jobId, {
      cancel: () => {
        try {
          xhr.abort();
          ctx.updateJob(jobId, { status: "failed" });
          setTimeout(() => ctx.removeJob(jobId), 5000);
        } catch (e) {}
      },
    });

    xhr.send(file);
  });
}

// ---------- large upload (session) ----------
async function uploadLargeFileDropboxFetch(
  ctx: globalUploadStateT,
  jobId: string,
  accessToken: string,
  file: File,
  path: string,
  chunkSize = 8 * 1024 * 1024 // 8 MB
) {
  let start = 0;
  let sessionId: string | null = null;
  const total = file.size;
  const abortCtrl = new AbortController();

  // install cancel
  ctx.updateJob(jobId, { cancel: () => abortCtrl.abort() });

  while (start < total) {
    const end = Math.min(start + chunkSize, total);
    const chunk = file.slice(start, end);

    if (start === 0) {
      // start session
      const res = await fetch(`${DROPBOX_CONTENT_API}/upload_session/start`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/octet-stream",
          "Dropbox-API-Arg": JSON.stringify({ close: false }),
        },
        body: chunk,
        signal: abortCtrl.signal,
      });

      if (!res.ok) {
        ctx.updateJob(jobId, { status: "failed" });
        setTimeout(() => ctx.removeJob(jobId), 5000);
        const text = await res.text();
        throw new Error(
          `Failed to start upload session: ${res.status} ${text}`
        );
      }

      const data = await res.json();
      sessionId = data.session_id;
      start = end;
      const percent = Math.round((start / total) * 100);
      ctx.updateJob(jobId, { progress: percent, status: "uploading" });
    } else if (end < total) {
      // append
      const res = await fetch(
        `${DROPBOX_CONTENT_API}/upload_session/append_v2`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/octet-stream",
            "Dropbox-API-Arg": JSON.stringify({
              cursor: { session_id: sessionId, offset: start },
              close: false,
            }),
          },
          body: chunk,
          signal: abortCtrl.signal,
        }
      );

      if (!res.ok) {
        ctx.updateJob(jobId, { status: "failed" });
        setTimeout(() => ctx.removeJob(jobId), 5000);
        const text = await res.text();
        throw new Error(`Failed to append chunk: ${res.status} ${text}`);
      }

      start = end;
      const percent = Math.round((start / total) * 100);
      ctx.updateJob(jobId, { progress: percent, status: "uploading" });
    } else {
      // finish
      const res = await fetch(`${DROPBOX_CONTENT_API}/upload_session/finish`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/octet-stream",
          "Dropbox-API-Arg": JSON.stringify({
            cursor: { session_id: sessionId, offset: start },
            commit: {
              path,
              mode: "add",
              autorename: true,
              mute: false,
            },
          }),
        },
        body: chunk,
        signal: abortCtrl.signal,
      });

      if (!res.ok) {
        ctx.updateJob(jobId, { status: "failed" });
        setTimeout(() => ctx.removeJob(jobId), 5000);
        const text = await res.text();
        throw new Error(`Failed to finish session: ${res.status} ${text}`);
      }

      const fileMeta = await res.json();
      ctx.updateJob(jobId, { progress: 100, status: "completed" });
      // remove after 5 seconds
      setTimeout(() => ctx.removeJob(jobId), 5000);
      return fileMeta;
    }
  }

  throw new Error("Unexpected end of uploadLargeFileDropboxFetch");
}

// ---------- wrapper that picks simple vs session ----------
async function uploadFileDropbox(
  ctx: globalUploadStateT,
  jobId: string,
  accessToken: string,
  file: File,
  path: string
) {
  // set pending
  ctx.updateJob(jobId, { status: "pending", progress: 0 });

  if (file.size <= SIMPLE_UPLOAD_LIMIT) {
    // use XHR to get progress events
    return uploadSimpleFileDropboxXHR(ctx, jobId, accessToken, file, path);
  }

  return uploadLargeFileDropboxFetch(ctx, jobId, accessToken, file, path);
}

// ---------- batch uploader ----------
async function batchUploadDropbox(
  ctx: globalUploadStateT,
  files: File[],
  concurrency = 3,
  folderPath = "" // optional folder path root
) {
  // fetch token here (re-fetch on token errors)
  let accessToken = await getFreshAccessToken();

  const results: {
    jobId: string;
    fileId?: string;
    filePath?: string;
    fileMeta?: any;
  }[] = [];
  let i = 0;

  async function worker() {
    while (i < files.length) {
      const file = files[i++];
      const jobId = ctx.addJob({
        id: crypto.randomUUID(),
        type: "dropbox",
        name: files?.[0]?.name ?? "dropbox upload",
      });
      const path = folderPath ? `${folderPath}/${file.name}` : `/${file.name}`;

      try {
        // attempt upload, retry once on auth error
        let fileMeta;
        try {
          fileMeta = await uploadFileDropbox(
            ctx,
            jobId,
            accessToken,
            file,
            path
          );
        } catch (err: any) {
          // detect token/401-ish errors and refresh once
          const isAuthErr =
            err?.status === 401 ||
            err?.message?.includes?.("401") ||
            err?.message?.toLowerCase?.().includes?.("invalid_access_token") ||
            err?.message?.toLowerCase?.().includes?.("token");

          if (isAuthErr) {
            accessToken = await getFreshAccessToken();
            fileMeta = await uploadFileDropbox(
              ctx,
              jobId,
              accessToken,
              file,
              path
            );
          } else {
            throw err;
          }
        }

        // success
        const fileId = fileMeta?.id;
        const filePath = fileMeta?.path_display ?? fileMeta?.path_lower ?? path;
        results.push({ jobId, fileId, filePath, fileMeta });

        // ensure job completed state & auto-remove if not already done in uploader
        ctx.updateJob(jobId, { status: "completed", progress: 100 });
        setTimeout(() => ctx.removeJob(jobId), 5000);
      } catch (err) {
        console.error("Upload failed for", file.name, err);
        ctx.updateJob(jobId, {
          status: "failed",
          progress: ctx.jobs?.find((j) => j.id === jobId)?.progress ?? 0,
        });
        setTimeout(() => ctx.removeJob(jobId), 5000);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

// ---------- makeFilePublic for Dropbox ----------
/**
 * Creates or returns an existing shared link for a Dropbox path or id.
 * Accepts either a path string like "/folder/file.ext" or a Dropbox file id (e.g. "id:...").
 */
export async function makeFilePublicDropbox(pathOrId: string) {
  if (!pathOrId) throw new Error("pathOrId required");

  const accessToken = await getFreshAccessToken();

  // Try to create a shared link
  const createRes = await fetch(
    "https://api.dropboxapi.com/2/sharing/create_shared_link_with_settings",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: pathOrId }),
    }
  );

  if (createRes.ok) {
    const data = await createRes.json();
    return data.url; // e.g. "https://www.dropbox.com/s/....?dl=0"
  }

  // If link already exists or conflict, try listing existing links
  const txt = await createRes.text();
  // some error responses contain 'shared_link_already_exists' or similar
  if (txt && txt.toLowerCase().includes("shared_link_already_exists")) {
    const listRes = await fetch(
      "https://api.dropboxapi.com/2/sharing/list_shared_links",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ path: pathOrId, direct_only: true }),
      }
    );

    if (listRes.ok) {
      const listData = await listRes.json();
      if (Array.isArray(listData.links) && listData.links.length > 0) {
        return listData.links[0].url;
      }
    }
  }

  // If it failed for other reasons, return the error body
  throw new Error(`Failed to create/get shared link: ${txt}`);
}

async function getFreshAccessToken() {
  const { data } = await appFetch<ShortLivedToken>(
    BackendRoutes.DROP_BOX_SHORT_LIVED
  );

  return data.access_token;
}
