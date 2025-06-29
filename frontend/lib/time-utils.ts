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

export function getBackgroundStyle(timeOfDay: TimeOfDay): string {
  switch (timeOfDay) {
    case "morning":
      return "bg-gradient-to-b from-[#A3D8FF] to-[#F9F8F7]"
    case "afternoon":
      return "bg-gradient-to-b from-[#FFED7D] to-[#F9F8F7]"
    case "evening":
      return "bg-gradient-to-b from-[#FF6B6B] to-[#D6A8F7]"
    case "night":
      return "bg-gradient-to-b from-[#1a1a2e] to-[#16213e] text-white"
    default:
      return "bg-gradient-to-b from-[#A3D8FF] to-[#F9F8F7]"
  }
}
