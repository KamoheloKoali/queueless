"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { updateOpeningHours } from "@/app/actions/checkout-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type OpeningHoursClientProps = {
  orderingEnabled: boolean;
  openingTime: string;
  closingTime: string;
  timezone: string;
  weeklySchedule: Array<{
    dayOfWeek: number;
    dayName: string;
    isOpen: boolean;
  }>;
};

export function OpeningHoursClient({
  orderingEnabled,
  openingTime,
  closingTime,
  timezone,
  weeklySchedule,
}: OpeningHoursClientProps) {
  const [enabled, setEnabled] = useState(orderingEnabled);
  const [openAt, setOpenAt] = useState(openingTime);
  const [closeAt, setCloseAt] = useState(closingTime);
  const [timezoneValue, setTimezoneValue] = useState(timezone);
  const [weekly, setWeekly] = useState(weeklySchedule);
  const [isPending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      let result;
      try {
        result = await updateOpeningHours({
          orderingEnabled: enabled,
          openingTime: openAt,
          closingTime: closeAt,
          timezone: timezoneValue,
          weeklySchedule: weekly.map((day) => ({
            dayOfWeek: day.dayOfWeek,
            isOpen: day.isOpen,
          })),
        });
      } catch {
        toast.error("Failed to update opening hours.");
        return;
      }

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      toast.success(result.message);
    });
  };

  return (
    <Card className="rounded-xl border py-0">
      <CardHeader className="px-4 py-3">
        <CardTitle>Opening Hours</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 px-4 pb-4">
        <label className="flex items-center gap-3 rounded-md border p-3">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="size-4 accent-primary"
          />
          <div>
            <p className="text-sm font-medium">Enable ordering</p>
            <p className="text-xs text-muted-foreground">
              Disable this to block all new orders immediately.
            </p>
          </div>
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs font-medium">Opening Time</label>
            <Input
              type="time"
              value={openAt}
              onChange={(event) => setOpenAt(event.target.value)}
              className="h-10 rounded-md"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium">Closing Time</label>
            <Input
              type="time"
              value={closeAt}
              onChange={(event) => setCloseAt(event.target.value)}
              className="h-10 rounded-md"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">Timezone</label>
          <Input
            value={timezoneValue}
            onChange={(event) => setTimezoneValue(event.target.value)}
            placeholder="Africa/Maseru"
            className="h-10 rounded-md"
          />
          <p className="text-xs text-muted-foreground">
            Use IANA timezone format, for example `Africa/Maseru` or `Africa/Nairobi`.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium">Days of the week</label>
          <div className="rounded-md border">
            {weekly.map((day) => (
              <label
                key={day.dayOfWeek}
                className="flex items-center justify-between gap-3 border-b px-3 py-2 last:border-b-0"
              >
                <span className="text-sm">{day.dayName}</span>
                <button
                  type="button"
                  onClick={() =>
                    setWeekly((current) =>
                      current.map((entry) =>
                        entry.dayOfWeek === day.dayOfWeek
                          ? { ...entry, isOpen: !entry.isOpen }
                          : entry,
                      ),
                    )
                  }
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    day.isOpen
                      ? "bg-green-100 text-green-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {day.isOpen ? "Open" : "Closed"}
                </button>
              </label>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Each day defaults to open. Toggle to closed if orders should not be accepted that day.
          </p>
        </div>

        <Button type="button" className="rounded-md" onClick={onSave} disabled={isPending}>
          Save Opening Hours
        </Button>
      </CardContent>
    </Card>
  );
}
