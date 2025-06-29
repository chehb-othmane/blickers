import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function ForumLoading() {
  return (
    <div className="min-h-screen flex bg-neutral-white-100 dark:bg-black">
      {/* Sidebar Skeleton */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 border-r bg-white dark:bg-black border-black/10 dark:border-white/10 shadow-sm">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-black/10 dark:border-white/10">
            <div className="flex items-center">
              <Skeleton className="h-10 w-10 rounded-full mr-3" />
              <div className="flex-1">
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 ml-64">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <Skeleton className="h-8 w-48" />
            <div className="flex space-x-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-9" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </Card>
            ))}
          </div>

          {/* Forum Content */}
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2 mb-4" />
                    <div className="flex space-x-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
