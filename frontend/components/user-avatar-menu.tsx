"use client"

import { useState } from "react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, Settings, LogOut, Home, Key } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function UserAvatarMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { user, logout } = useAuth()

  const getDashboardLink = () => {
    if (!user) return "/"
    return `/dashboard-${user.role.toLowerCase()}`
  }

  const getInitials = () => {
    if (!user) return ""
    return `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-white/10 hover:border-white/20 transition-all">
            <AvatarImage src={user?.profile_picture || "/placeholder.svg"} alt={user?.first_name || ""} />
            <AvatarFallback className="bg-[#6262cf] text-white">{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.first_name} {user?.last_name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Link href={getDashboardLink()} className="flex items-center w-full">
              <Home className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`${getDashboardLink()}/profile`} className="flex items-center w-full">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href={`${getDashboardLink()}/settings`} className="flex items-center w-full">
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
