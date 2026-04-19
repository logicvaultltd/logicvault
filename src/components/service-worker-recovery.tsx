"use client";

import { useEffect } from "react";

const RECOVERY_KEY = "logicvault-sw-recovery-v2";
const CACHE_NAME_FRAGMENTS = [
  "logicvault",
  "workbox",
  "next-",
  "pages",
  "static",
  "start-url",
];

function isOfflineRoute(pathname: string) {
  return pathname.includes("~offline");
}

export function ServiceWorkerRecovery() {
  useEffect(() => {
    const pathname = window.location.pathname;
    const onOfflineRoute = isOfflineRoute(pathname);
    const hasRecovered = window.localStorage.getItem(RECOVERY_KEY);

    if (hasRecovered && !onOfflineRoute) {
      return;
    }

    let cancelled = false;

    async function recoverFromStaleWorker() {
      try {
        if ("serviceWorker" in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(
            registrations.map((registration) => registration.unregister()),
          );
        }

        if ("caches" in window) {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames
              .filter((name) => {
                const lowerName = name.toLowerCase();
                return CACHE_NAME_FRAGMENTS.some((fragment) =>
                  lowerName.includes(fragment),
                );
              })
              .map((name) => caches.delete(name)),
          );
        }

        window.localStorage.setItem(RECOVERY_KEY, String(Date.now()));
      } finally {
        if (!cancelled && onOfflineRoute && navigator.onLine) {
          window.location.replace("/");
        }
      }
    }

    void recoverFromStaleWorker();

    const handleOnline = () => {
      if (isOfflineRoute(window.location.pathname)) {
        window.location.replace("/");
      }
    };

    window.addEventListener("online", handleOnline);

    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return null;
}
