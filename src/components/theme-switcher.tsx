"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const THEME_CYCLE = ["light", "dark", "system"] as const;

type ThemeChoice = (typeof THEME_CYCLE)[number];

const THEME_ICON = {
  light: Sun,
  dark: Moon,
  system: Monitor,
} as const;

function isThemeChoice(value: string | undefined): value is ThemeChoice {
  return value === "light" || value === "dark" || value === "system";
}

function nextTheme(current: string | undefined): ThemeChoice {
  const resolved = isThemeChoice(current) ? current : "system";
  const index = THEME_CYCLE.indexOf(resolved);
  return THEME_CYCLE[(index + 1) % THEME_CYCLE.length];
}

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const current: ThemeChoice = isThemeChoice(theme) ? theme : "system";
  const next = nextTheme(current);

  if (!mounted) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        disabled
        aria-label="Theme"
      />
    );
  }

  const Icon = THEME_ICON[current];

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(next)}
      aria-label={`Theme is ${current}. Switch to ${next}.`}
    >
      <Icon />
    </Button>
  );
}
