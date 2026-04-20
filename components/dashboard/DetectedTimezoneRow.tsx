"use client";

import { useEffect, useState } from "react";

/**
 * Read-only display of the browser's detected IANA timezone.
 *
 * Full timezone preference editing requires a User.timezone column
 * + migration + sync logic, which is bigger than a single bug fix.
 * This at least tells the user which TZ their daily-log dates are
 * being recorded in so global users can reconcile 'logged yesterday'
 * with their local calendar.
 */
export function DetectedTimezoneRow() {
  const [tz, setTz] = useState<string | null>(null);
  const [offset, setOffset] = useState<string | null>(null);

  useEffect(() => {
    try {
      const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTz(detected);
      const mins = new Date().getTimezoneOffset();
      const sign = mins <= 0 ? "+" : "-";
      const abs = Math.abs(mins);
      const hh = String(Math.floor(abs / 60)).padStart(2, "0");
      const mm = String(abs % 60).padStart(2, "0");
      setOffset(`UTC${sign}${hh}:${mm}`);
    } catch {
      // Intl not supported — leave null, the UI falls back to a dash
    }
  }, []);

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
