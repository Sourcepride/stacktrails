import { BACKEND_API_URL, DocumentPlatform } from "@/constants";
import { BackendRoutes } from "@/routes";

export function storageCheckOrRedirect(
  value: DocumentPlatform,
  data: ProviderList,
  callback: () => void
) {
  switch (value) {
    case DocumentPlatform.GOOGLE_DRIVE: {
      const storageExists = data?.items?.find?.(
        (e) =>
          e.provider === "google" &&
          !!e.scopes?.includes("https://www.googleapis.com/auth/drive")
      );

      if (storageExists) {
        callback?.();
        return;
      }

      authRedirect(DocumentPlatform.GOOGLE_DRIVE);

      return;
    }

    case DocumentPlatform.DROPBOX: {
      const storageExists = data?.items?.find?.(
        (e) =>
          e.provider === "dropbox" &&
          !!e.scopes?.includes("files.metadata.read") &&
          !!e.scopes?.includes("files.metadata.write")
      );

      if (storageExists) {
        callback?.();
        return;
      }

      authRedirect(DocumentPlatform.DROPBOX);
      return;
    }

    default:
      return;
  }

  // try and get provider token
  // if provider exists navigate to specific
  // else push to incremental authorization with callback url as current href
}

export function authRedirect(platform: DocumentPlatform) {
  let url: URL = null as any;

  switch (platform) {
    case DocumentPlatform.GOOGLE_DRIVE:
      {
        url = new URL(BACKEND_API_URL + BackendRoutes.GOOGLE_INCREMENTAL);
        url.searchParams.append(
          "required_scopes",
          "openid email profile https://www.googleapis.com/auth/drive"
        );
      }
      break;
    case DocumentPlatform.DROPBOX:
      {
        url = new URL(BACKEND_API_URL + BackendRoutes.DROPBOX_AUTH);
      }
      break;
  }

  if (!url) return;

  url.searchParams.append("redirect", location.href);
  location.href = url.toString();
}
