"use client";

import { useTheme } from "next-themes";
import { Monitor, Moon, Sun, type LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMe } from "@/hooks/use-auth";
import { useUpdateSettings } from "@/hooks/use-settings";
import { cn } from "@/lib/utils";
import { THEME_OPTIONS } from "@/lib/validation/settings";

const META: Record<string, { label: string; icon: LucideIcon; theme: string }> = {
  LIGHT: { label: "Light", icon: Sun, theme: "light" },
  DARK: { label: "Dark", icon: Moon, theme: "dark" },
  SYSTEM: { label: "System", icon: Monitor, theme: "system" },
};

export default function AppearanceSettingsPage() {
  const { data: me } = useMe();
  const { setTheme, theme: activeTheme } = useTheme();
  const update = useUpdateSettings();
  const selected = me?.settings?.theme ?? "SYSTEM";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">Choose how PicklePlay looks to you.</p>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const m = META[opt]!;
            const isActive = activeTheme === m.theme || (selected === opt && !activeTheme);
            return (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  setTheme(m.theme);
                  update.mutate({ theme: opt });
                }}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-colors",
                  isActive
                    ? "border-primary bg-accent/40"
                    : "border-border hover:bg-secondary",
                )}
              >
                <m.icon className="size-6" />
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
