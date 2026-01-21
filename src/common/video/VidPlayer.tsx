"use client";

import dynamic from "next/dynamic";

// Re-export the context for backward compatibility
export { ReactPlayerProvider } from "./VidPlayerClient";

// Use proper dynamic import pattern to avoid params/searchParams enumeration
// Load only on client side to prevent React Player from accessing Next.js APIs
const VidPlayer = dynamic(
  () => {
    // Ensure we're on the client before importing
    if (typeof window === "undefined") {
      return Promise.resolve(() => null);
    }
    return import("./VidPlayerClient");
  },
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          height: "100%",
          backgroundColor: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
        }}
      >
        Loading video player...
      </div>
    ),
  }
);

export default VidPlayer;
