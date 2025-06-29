export type TimeOfDay = "morning" | "afternoon" | "evening" | "night"

export function getTimeOfDay(): TimeOfDay {
  const hour = new Date().getHours()

  if (hour >= 5 && hour < 12) {
    return "morning"
  } else if (hour >= 12 && hour < 17) {
    return "afternoon"
  } else if (hour >= 17 && hour < 21) {
    return "evening"
  } else {
    return "night"
  }
}

// New minimalist black and white color palette
export const colors = {
  background: {
    light: "#FFFFFF",
    dark: "#F5F5F7",
    accent: "#F0F0F2",
  },
  primary: {
    main: "#000000",
    light: "#333333",
    dark: "#111111",
  },
  secondary: {
    main: "#555555",
    light: "#777777",
    dark: "#333333",
  },
  accent: {
    main: "#DDDDDD",
    light: "#EEEEEE",
    dark: "#CCCCCC",
  },
  text: {
    primary: "#000000",
    secondary: "rgba(0, 0, 0, 0.7)",
    disabled: "rgba(0, 0, 0, 0.5)",
  },
}

export function getBackgroundStyle(): string {
  // Always use light background
  return "bg-white text-black"
}

export function getGlassPanelStyle(opacity: "low" | "medium" | "high" = "medium"): string {
  const opacityValues = {
    low: "bg-black/5",
    medium: "bg-black/10",
    high: "bg-black/20",
  }

  return `${opacityValues[opacity]} backdrop-blur-lg border border-black/10 rounded-xl`
}

export function getMinimalBorder(): string {
  return "border border-black/10"
}

export function getMinimalShadow(): string {
  return "shadow-[0_2px_10px_rgba(0,0,0,0.05)]"
}
