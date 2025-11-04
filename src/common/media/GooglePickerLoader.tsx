// components/GooglePickerLoader.tsx
"use client";

import Script from "next/script";

export default function GooglePickerLoader(props: { onLoaded?: () => void }) {
  return (
    <>
      {/* Load gapi (Google API client library) */}
      <Script
        src="https://apis.google.com/js/api.js"
        strategy="afterInteractive"
        onLoad={() => {
          (window as any).gapi?.load("picker", () => {
            props?.onLoaded?.();
          });
        }}
      />

      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />
    </>
  );
}
