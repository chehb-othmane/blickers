"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface AlreadyLoggedInModalProps {
  userType?: "admin" | "member" | "student"
  isOpen: boolean
  onClose: () => void
}

export function AlreadyLoggedInModal({ userType = "student", isOpen, onClose }: AlreadyLoggedInModalProps) {
  const router = useRouter()

  const getDashboardLink = () => {
    switch (userType) {
      case "admin":
        return "/dashboard-admin"
      case "member":
        return "/dashboard-member"
      case "student":
      default:
        return "/dashboard-student"
    }
  }

  const handleGoToDashboard = () => {
    router.push(getDashboardLink())
  }

  const handleGoToHome = () => {
    router.push("/")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>You're already logged in</DialogTitle>
          <DialogDescription>You are currently logged in to your account. What would you like to do?</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 py-4">
          <div className="rounded-full bg-yellow-100 p-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-yellow-600"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm text-gray-600">
            You don't need to log in again. You can go to your dashboard or return to the home page.
          </p>
        </div>
        <DialogFooter className="flex flex-row space-x-2 sm:justify-end">
          <Button variant="outline" onClick={handleGoToHome}>
            Back to Home
          </Button>
          <Button onClick={handleGoToDashboard} className="bg-[#6262cf] hover:bg-[#5252bf]">
            Go to Dashboard
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
