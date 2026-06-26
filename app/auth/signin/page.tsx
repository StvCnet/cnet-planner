"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import Image from "next/image";

export default function SignInPage() {
  useEffect(() => {
    signIn("azure-ad", { callbackUrl: "/" });
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: "var(--bg-base)" }}
    >
      <Image src="/compunet.png" alt="Compunet" width={180} height={52} priority />
      <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
        Redirigiendo a Microsoft…
      </p>
    </div>
  );
}
