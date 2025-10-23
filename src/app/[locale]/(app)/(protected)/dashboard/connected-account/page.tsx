"use client";

import { useAppStore } from "@/store";

export default function Page() {
  const { user, currentProfile } = useAppStore((state) => state);
  return (
    <div>
      <section>
        <h1>Connected providers & scopes</h1>
      </section>

      <section>
        <div></div>
        <div></div>
      </section>
    </div>
  );
}
