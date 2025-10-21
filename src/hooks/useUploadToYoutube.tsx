import { appFetch } from "@/lib/appFetch";
import { BackendRoutes } from "@/routes";
import { useUploads } from "./useUploads";

// ==============================
// Interfaces
// ==============================
interface YouTubeUploadMetadata {
  snippet: {
    title: string;
    description?: string;
    tags?: string[];
    categoryId?: string;
  };
  status?: {
    privacyStatus?: "private" | "public" | "unlisted";
  };
}

interface FileWithMeta {
  file: File;
  metadata: YouTubeUploadMetadata;
}

type UploadJob = {
  id: string;
  name?: string;
  type: "google_drive" | "youtube" | "dropbox";
  status: "pending" | "uploading" | "completed" | "failed";
  progress: number;
  cancel?: () => void;
};

type globalUploadStateT = {
  addJob: (job: Omit<UploadJob, "status" | "progress">) => string;
  updateJob: (id: string, data: Partial<UploadJob>) => void;
  removeJob: (id: string) => void;
  jobs: UploadJob[];
};

// ==============================
// Hook
// ==============================
export const useUploadToYoutube = () => {
  const ctx = useUploads();

  return async ({
    filesMeta,
    concurrency = 2,
  }: {
    filesMeta: FileWithMeta[];
    concurrency?: number;
  }) => {
    const res = await batchUploadYouTube(ctx, filesMeta, concurrency);
    return res;
  };
};

export default useUploadToYoutube;

// ==============================
// Start resumable session
// ==============================
async function startYouTubeSession(
  accessToken: string,
  file: File,
  metadata: YouTubeUploadMetadata
): Promise<string> {
  const url =
    "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable";

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json; charset=UTF-8",
      "X-Upload-Content-Length": file.size.toString(),
      "X-Upload-Content-Type": file.type,
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    throw new Error(
      `Failed to start upload session: ${res.status} ${await res.text()}`
    );
  }

  const sessionURL = res.headers.get("Location");
  if (!sessionURL) {
    throw new Error("No session URL returned by YouTube");
  }
  return sessionURL;
}

// ==============================
// Upload chunks (with progress + cancel)
// ==============================
async function uploadYouTubeInChunks(
  ctx: globalUploadStateT,
  jobId: string,
  sessionURL: string,
  file: File,
  chunkSize = 1024 * 1024 * 5 // 5MB is safer than 256KB
) {
  let start = 0;
  const total = file.size;
  const abortCtrl = new AbortController();

  // Attach cancel
  ctx.updateJob(jobId, { cancel: () => abortCtrl.abort() });

  while (start < total) {
    const end = Math.min(start + chunkSize, total) - 1;
    const chunk = file.slice(start, end + 1);

    const res = await fetch(sessionURL, {
      method: "PUT",
      headers: {
        "Content-Length": `${chunk.size}`,
        "Content-Type": file.type,
        "Content-Range": `bytes ${start}-${end}/${total}`,
      },
      body: chunk,
      signal: abortCtrl.signal,
    });

    if (res.status === 308) {
      // incomplete
      start = end + 1;
      const percent = Math.round((start / total) * 100);
      ctx.updateJob(jobId, { progress: percent, status: "uploading" });
    } else if (res.ok) {
      // finished
      const json = await res.json();
      ctx.updateJob(jobId, { progress: 100, status: "completed" });
      setTimeout(() => ctx.removeJob(jobId), 5000);
      return json;
    } else {
      ctx.updateJob(jobId, { status: "failed" });
      setTimeout(() => ctx.removeJob(jobId), 5000);
      throw new Error(`Upload chunk failed: ${res.status} ${await res.text()}`);
    }
  }

  throw new Error("Upload did not complete");
}

// ==============================
// Upload one video
// ==============================
async function uploadOneYouTubeVideo(
  ctx: globalUploadStateT,
  jobId: string,
  accessToken: string,
  file: File,
  metadata: YouTubeUploadMetadata
) {
  ctx.updateJob(jobId, { status: "pending", progress: 0 });
  const sessionURL = await startYouTubeSession(accessToken, file, metadata);
  return await uploadYouTubeInChunks(ctx, jobId, sessionURL, file);
}

// ==============================
// Batch uploader
// ==============================
async function batchUploadYouTube(
  ctx: globalUploadStateT,
  filesMeta: FileWithMeta[],
  concurrency = 2
) {
  let accessToken = await getFreshAccessToken();

  const results: any[] = [];
  let i = 0;

  async function worker() {
    while (i < filesMeta.length) {
      const { file, metadata } = filesMeta[i++];
      const jobId = ctx.addJob({
        id: crypto.randomUUID(),
        type: "youtube",
        name: file.name ?? "youtube_no_name",
      });

      try {
        let result;
        try {
          result = await uploadOneYouTubeVideo(
            ctx,
            jobId,
            accessToken,
            file,
            metadata
          );
        } catch (err: any) {
          if (err.message.includes("401")) {
            accessToken = await getFreshAccessToken();

            result = await uploadOneYouTubeVideo(
              ctx,
              jobId,
              accessToken,
              file,
              metadata
            );
          } else {
            throw err;
          }
        }

        results.push(result);
        ctx.updateJob(jobId, { status: "completed", progress: 100 });
        setTimeout(() => ctx.removeJob(jobId), 5000);
      } catch (err) {
        console.error("YouTube upload failed for", file.name, err);
        ctx.updateJob(jobId, { status: "failed" });
        setTimeout(() => ctx.removeJob(jobId), 5000);
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return results;
}

async function getFreshAccessToken() {
  const { data } = await appFetch<ShortLivedToken>(
    BackendRoutes.GOOGLE_SHORT_LIVED
  );

  return data.access_token;
}
