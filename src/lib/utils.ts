import { BackendRoutes } from "@/routes";
import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const baseURL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8020/api/v1";

export function googleOneTapForm(cred: string, next: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = `${baseURL}${BackendRoutes.GOOGLE_ONE_TAP}`;

  const credentialInput = document.createElement("input");
  credentialInput.type = "hidden";
  credentialInput.name = "credential";
  credentialInput.value = cred;

  const redirectInput = document.createElement("input");
  redirectInput.type = "hidden";
  redirectInput.name = "redirect";
  redirectInput.value = next;

  form.appendChild(credentialInput);
  form.appendChild(redirectInput);

  document.body.appendChild(form);
  form.submit();
}

export function getImageProxyUrl(url?: string, defaultImg = undefined) {
  if (!url) {
    return defaultImg || "/";
  }

  if (
    url.startsWith(
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8082"
    )
  )
    return url;

  return `${
    process.env.NEXT_PUBLIC_API_URL
  }/media/proxy?url=${encodeURIComponent(url)}`;
}

export function getNumberUnit(num: number): "1K" | "1M" | "1B" | string {
  if (num >= 1_000_000_000) {
    return `${Number((num / 1000000000).toFixed(1))}B`;
  } else if (num >= 1_000_000) {
    return `${Number((num / 1000000).toFixed(1))}M`;
  } else if (num >= 1_000) {
    return `${Number((num / 1000).toFixed(1))}K`;
  }
  return num.toString();
}

export function timeAgo(isoDate: string): string {
  let result = formatDistanceToNow(new Date(isoDate), { addSuffix: true });

  // Normalize time units
  result = result
    .replace(/\bminutes\b/g, "mins")
    .replace(/\bminute\b/g, "min")
    .replace(/\bhours\b/g, "hrs")
    .replace(/\bhour\b/g, "hr");

  return result;
}
// Convert ISO 639-1 code to full language name
export function getLanguageName(code: string, displayLocale = "en"): string {
  const dn = new Intl.DisplayNames([displayLocale], { type: "language" });
  return dn.of(code) ?? code;
}

function toDropboxDirect(url: string) {
  try {
    const u = new URL(url);
    if (!u.hostname.includes("dropbox.com")) return url;

    // If there's a dl param, set it to 1
    if (u.searchParams.has("dl")) {
      u.searchParams.set("dl", "1");
      return u.toString();
    }

    // Otherwise set raw=1 (works for /s/ and /scl/fi/ variants)
    u.searchParams.set("raw", "1");
    return u.toString();
  } catch {
    return url;
  }
}

// helpers/drive.ts
export function toGoogleDriveDirect(url: string) {
  try {
    // capture /d/<id>/ style
    const m = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    if (m && m[1]) return `https://drive.google.com/uc?export=view&id=${m[1]}`;

    // capture ?id= style
    const u = new URL(url);
    const id = u.searchParams.get("id");
    if (id) return `https://drive.google.com/uc?export=view&id=${id}`;

    return url;
  } catch {
    return url;
  }
}

export function getThumbnailViewUrl(rawUrl: string) {
  const url = new URL(rawUrl);

  if (url.hostname.includes("dropbox.com")) {
    return toDropboxDirect(rawUrl);
  } else if (url.hostname.includes("drive.google.com")) {
    return toGoogleDriveDirect(rawUrl);
  }

  return rawUrl;
}

type Provider = "youtube" | "dailymotion" | "dropbox" | "google_drive";

export function extractExternalId(
  provider: Provider,
  url: string
): string | null {
  switch (provider) {
    case "youtube": {
      // Matches:
      // - https://www.youtube.com/watch?v=VIDEO_ID
      // - https://youtu.be/VIDEO_ID
      // - https://www.youtube.com/embed/VIDEO_ID
      const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
      );
      return match ? match[1] : null;
    }

    case "dailymotion": {
      // Matches:
      // - https://www.dailymotion.com/video/VIDEO_ID
      // - https://www.dailymotion.com/embed/video/VIDEO_ID
      const match = url.match(
        /dailymotion\.com\/(?:embed\/)?video\/([a-zA-Z0-9]+)/
      );
      return match ? match[1] : null;
    }

    case "dropbox": {
      // Matches: https://www.dropbox.com/s/FILE_ID/filename?dl=0
      let match = url.match(/dropbox\.com\/s\/([a-zA-Z0-9]+)/);
      if (match) return match[1];

      // Matches: https://dl.dropboxusercontent.com/scl/fi/FILE_ID/filename
      match = url.match(/dropboxusercontent\.com\/scl\/fi\/([a-zA-Z0-9]+)/);
      if (match) return match[1];

      return null;
    }

    case "google_drive": {
      // Try `/file/d/FILE_ID/`
      let match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
      if (match) return match[1];

      // Try `uc?id=FILE_ID` or `uc?export=download&id=FILE_ID`
      match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (match) return match[1];

      return null;
    }

    default:
      return null;
  }
}
