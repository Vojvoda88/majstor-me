"use client";

import { useEffect } from "react";

export function GuestAccessPersist({ token }: { token: string }) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const link = `${window.location.origin}/request-access/${encodeURIComponent(token)}`;
    window.localStorage.setItem("bm:lastGuestRequestLink", link);
    window.localStorage.setItem("bm:lastGuestRequestSavedAt", String(Date.now()));
  }, [token]);

  return null;
}

