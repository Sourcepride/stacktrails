import { BACKEND_API_URL, DocumentPlatform } from "@/constants";
import { appFetch } from "@/lib/appFetch";
import { verifyScopes } from "@/lib/utils";
import { BackendRoutes } from "@/routes";

export async function storageCheckOrRedirect(
  value: DocumentPlatform,
  data: ProviderList,
  callback: () => void
) {
  switch (value) {
    case DocumentPlatform.GOOGLE_DRIVE: {
      const storageExists = data?.items?.find?.((e) => e.provider === "google");

      if (
        storageExists &&
        (await verifyScopes("https://www.googleapis.com/auth/drive.file"))
      ) {
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
          "openid email profile https://www.googleapis.com/auth/drive.file"
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

export function openPicker(
  accessToken: string,
  onPicked: (docs: any[]) => void,
  onClose: () => void,
  mimeTypes?: string[],
  isFolder?: boolean
) {
  const browserWindow = window as any;

  if (
    !browserWindow?.google ||
    !browserWindow.google.picker ||
    !browserWindow.gapi
  ) {
    throw new Error("Google Picker API not loaded");
  }

  const view = new browserWindow.google.picker.DocsView();

  if (isFolder) {
    view.setIncludeFolders(true).setSelectFolderEnabled(true);
  }

  if (mimeTypes?.length) {
    view.setMimeTypes(mimeTypes.join(","));
  }

  const picker = new browserWindow.google.picker.PickerBuilder()
    .addView(view)
    .setOAuthToken(accessToken)
    .setDeveloperKey(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!)
    .setAppId(process.env.NEXT_PUBLIC_GOOGLE_APP_ID!)
    .setCallback((data: any) => {
      const pickerAction = browserWindow.google.picker.Action;
      if (data.action === pickerAction.PICKED) {
        onPicked(data.docs);
      }
      // ✅ Destroy picker reference after close
      if (data.action === pickerAction.CANCEL) {
        onClose();
      }
      // ensures a clean rebuild next time
      (window as any).__lastPicker = null;
    })
    .build();

  picker.setVisible(true);
  (window as any).__lastPicker = picker;
}

export async function getFreshGoogleAccessToken() {
  const { data } = await appFetch<ShortLivedToken>(
    BackendRoutes.GOOGLE_SHORT_LIVED
  );

  return data.access_token;
}
