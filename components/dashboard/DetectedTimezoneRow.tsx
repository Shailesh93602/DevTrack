"use client";

import { useSyncExternalStore } from "react";

/**
 * Read-only display of the browser's detected IANA timezone.
 *
 * Full timezone preference editing requires a User.timezone column
 * + migration + sync logic, which is bigger than a single bug fix.
 * This at least tells the user which TZ their daily-log dates are
 * being recorded in so global users can reconcile 'logged yesterday'
 * with their local calendar.
 */

// useSyncExternalStore avoids the react-hooks/set-state-in-effect lint
// and cleanly separates server snapshot (null) from client snapshot
// (detected zone). Subscribe is a no-op — timezone doesn't change
// during a session under any realistic condition we care about.
const NOOP_UNSUBSCRIBE = () => {};
const subscribe = () => NOOP_UNSUBSCRIBE;

function getClientSnapshot(): { tz: string; offset: string } | null {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const mins = new Date().getTimezoneOffset();
    const sign = mins <= 0 ? "+" : "-";
    const abs = Math.abs(mins);
    const hh = String(Math.floor(abs / 60)).padStart(2, "0");
    const mm = String(abs % 60).padStart(2, "0");
    return { tz, offset: `UTC${sign}${hh}:${mm}` };
  } catch {
    return null;
  }
}

function getServerSnapshot(): { tz: string; offset: string } | null {
  return null;
}

export function DetectedTimezoneRow() {
  const detected = useSyncExternalStore(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const tz = detected?.tz ?? null;
  const offset = detected?.offset ?? null;

  return (
    <div className="space-y-1">
      <p className="text-foreground text-sm font-medium">Time zone</p>
      <p className="text-muted-foreground text-sm">
        {tz ? (
          <>
            {tz}
            {offset ? ` (${offset})` : ""}
          </>
        ) : (
          "—"
        )}
      </p>
      <p className="text-muted-foreground text-xs">
        Daily logs are recorded against this detected device time zone.
        Changing your device time zone will change how today&apos;s log is
        dated.
      </p>
    </div>
  );
}
