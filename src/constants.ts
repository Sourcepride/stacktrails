export const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;
export const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

export enum DocumentPlatform {
  GOOGLE_DRIVE = "google_drive",
  DROPBOX = "dropbox",
  ONEDRIVE = "onedrive",
  DIRECT_LINK = "direct_link",
}

export enum MediaType {
  IMAGE = "image",
  PDF = "pdf",
  DOCUMENT = "document",
  VIDEO = "video",
  OTHER = "other",
}

export const MIME_TYPE_GROUPS = {
  document: [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ],
  video: [
    "video/mp4",
    "video/x-msvideo",
    "video/quicktime",
    "video/x-ms-wmv",
    "video/mpeg",
    "video/x-matroska",
    "video/x-flv",
  ],
  image: ["image/jpeg", "image/png", "image/webp", "image/svg+xml"],
};
