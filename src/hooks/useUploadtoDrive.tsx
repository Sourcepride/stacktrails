import { appFetch } from "@/lib/appFetch";
import { BackendRoutes } from "@/routes";
import { useUploads } from "./useUploads";

type batchUploadReturnT = {
  kind: string;
  id: string;
  fileId: string;
  jobId: string;
  mimeType: string;
  name: string;
};

const useUploadToDrive = () => {
  const ctx = useUploads();

  return async ({
    files,
    concurrency,
  }: {
    files: File[];
    concurrency?: number;
  }) => {
    const res = await batchResumableUpload(ctx, files, concurrency);
    const urls = await Promise.all(
      res.map((d) => makeGoogleFilePublic(d.fileId))
    );

    // TODO:  construct url

    return urls;
  };
};

export default useUploadToDrive;

// Create a resumable upload session for a file
async function createResumableSession(accessToken: string, file: File) {
  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
      },
      body: JSON.stringify({
        name: file.name,
        mimeType: file.type,
      }),
    }
  );

  if (!res.ok) throw new Error("Failed to create resumable session");
  const uploadUrl = res.headers.get("Location");
  if (!uploadUrl) throw new Error("No upload URL returned");

  return uploadUrl;
}

async function uploadFileChunks(
  ctx: globalUploadStateT,
  jobId: string,
  uploadUrl: string,
  file: File,
  chunkSize = 256 * 1024,
  signal?: AbortSignal
) {
  let start = 0;
  const total = file.size;

  while (start < total) {
    const end = Math.min(start + chunkSize, total) - 1;
    const chunk = file.slice(start, end + 1);

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": `${chunk.size}`,
        "Content-Range": `bytes ${start}-${end}/${total}`,
      },
      body: chunk,
      signal,
    });

    if (res.status === 200 || res.status === 201) {
      ctx.updateJob(jobId, { status: "completed", progress: 100 });
      setTimeout(() => ctx.removeJob(jobId), 5000);
      return await res.json();
    }

    if (res.status !== 308) {
      ctx.updateJob(jobId, { status: "failed" });
      throw new Error(`Chunk upload failed with status ${res.status}`);
    }

    start = end + 1;
    const percent = Math.round((start / total) * 100);
    ctx.updateJob(jobId, { progress: percent, status: "uploading" });
  }

  throw new Error("Upload did not complete");
}

async function resumableUpload(
  ctx: globalUploadStateT,
  file: File,
  accessToken: string
): Promise<batchUploadReturnT> {
  const jobId = ctx.addJob({
    id: crypto.randomUUID(),
    type: "google_drive",
    name: file.name,
  });

  const abortCtrl = new AbortController();
  ctx.updateJob(jobId, {
    status: "pending",
    progress: 0,
    cancel: () => abortCtrl.abort(),
  });

  try {
    const uploadUrl = await createResumableSession(accessToken, file);
    const result = await uploadFileChunks(
      ctx,
      jobId,
      uploadUrl,
      file,
      256 * 1024,
      abortCtrl.signal
    );
    return { ...result, jobId, fileId: result.id };
  } catch (err) {
    if ((err as any).name === "AbortError") {
      ctx.updateJob(jobId, { status: "failed" });
      setTimeout(() => ctx.removeJob(jobId), 5000);
    }
    throw err;
  }
}
async function batchResumableUpload(
  ctx: globalUploadStateT,
  files: File[],
  concurrency = 3
) {
  let accessToken = await getFreshAccessToken();
  const results: batchUploadReturnT[] = [];
  let i = 0;

  async function worker() {
    while (i < files.length) {
      const file = files[i++];
      try {
        const uploaded = await resumableUpload(ctx, file, accessToken);
        results.push(uploaded);
      } catch (err: any) {
        if (err.message === "TOKEN_EXPIRED") {
          accessToken = await getFreshAccessToken();
          const uploaded = await resumableUpload(ctx, file, accessToken);
          results.push(uploaded);
        } else {
          console.error("Upload failed:", err);
        }
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

export async function makeGoogleFilePublic(
  fileId: string,
  access_token?: string
) {
  let accessToken = access_token || (await getFreshAccessToken());

  try {
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          role: "reader",
          type: "anyone",
        }),
      }
    );

    if (!res.ok) {
      console.error(
        "Failed to make file public:",
        res.status,
        await res.text()
      );
      throw new Error("Permission creation failed");
    }

    // console.log(`Made ${fileId} Public ✅`);

    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  } catch (err: any) {
    if (err.message === "TOKEN_EXPIRED") {
      accessToken = await getFreshAccessToken();
      return makeGoogleFilePublic(fileId); // retry once
    } else {
      console.error(`Failed to make ${fileId} Public ❌`, err);
      throw err;
    }
  }
}

async function getFreshAccessToken() {
  const { data } = await appFetch<ShortLivedToken>(
    BackendRoutes.GOOGLE_SHORT_LIVED
  );

  return data.access_token;
}
