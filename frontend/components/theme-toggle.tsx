"use client"

import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/lib/theme-context"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
          >
            {theme === "light" ? (
              <Moon className="h-5 w-5 text-black/70 dark:text-white/70" />
            ) : (
              <Sun className="h-5 w-5 text-white/70" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{theme === "light" ? "Switch to dark mode" : "Switch to light mode"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
