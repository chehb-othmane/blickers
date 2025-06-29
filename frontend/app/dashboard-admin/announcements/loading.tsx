import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AnnouncementsLoading() {
  return (
    <div className="min-h-screen bg-neutral-white-100 dark:bg-black text-black dark:text-white theme-transition">
      <div className="container mx-auto p-6">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <Skeleton className="h-8 w-80 mb-2 bg-black/10 dark:bg-white/10" />
            <Skeleton className="h-4 w-96 bg-black/10 dark:bg-white/10" />
          </div>
          <Skeleton className="h-10 w-48 mt-4 md:mt-0 bg-black/10 dark:bg-white/10" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 border border-black/10 dark:border-white/10 bg-white dark:bg-black">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <Skeleton className="h-4 w-24 mb-2 bg-black/10 dark:bg-white/10" />
                  <Skeleton className="h-8 w-16 mb-1 bg-black/10 dark:bg-white/10" />
                  <Skeleton className="h-3 w-20 bg-black/10 dark:bg-white/10" />
                </div>
                <Skeleton className="h-9 w-9 rounded-full bg-black/10 dark:bg-white/10" />
              </div>
            </Card>
          ))}
        </div>

        {/* Filters Skeleton */}
        <Card className="p-4 mb-6 border border-black/10 dark:border-white/10 bg-white dark:bg-black">
          <div className="flex flex-col md:flex-row gap-4">
            <Skeleton className="h-10 flex-1 bg-black/10 dark:bg-white/10" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-32 bg-black/10 dark:bg-white/10" />
              <Skeleton className="h-10 w-32 bg-black/10 dark:bg-white/10" />
            </div>
          </div>
        </Card>

        {/* Announcements Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-black">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3 flex-1">
                  <Skeleton className="h-10 w-10 rounded-full bg-black/10 dark:bg-white/10" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-64 mb-2 bg-black/10 dark:bg-white/10" />
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-20 bg-black/10 dark:bg-white/10" />
                      <Skeleton className="h-4 w-16 bg-black/10 dark:bg-white/10" />
                      <Skeleton className="h-5 w-16 rounded-full bg-black/10 dark:bg-white/10" />
                    </div>
                  </div>
                </div>
                <Skeleton className="h-8 w-8 bg-black/10 dark:bg-white/10" />
              </div>

              <Skeleton className="h-16 w-full mb-4 bg-black/10 dark:bg-white/10" />

              <div className="flex items-center justify-between pt-4 border-t border-black/10 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-4 w-12 bg-black/10 dark:bg-white/10" />
                  <Skeleton className="h-4 w-8 bg-black/10 dark:bg-white/10" />
                  <Skeleton className="h-4 w-8 bg-black/10 dark:bg-white/10" />
                </div>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-20 bg-black/10 dark:bg-white/10" />
                  <Skeleton className="h-2 w-16 bg-black/10 dark:bg-white/10" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
