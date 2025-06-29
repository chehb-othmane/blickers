import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"

export default function UsersLoading() {
  return (
    <div className="min-h-screen bg-neutral-white-100 dark:bg-black p-6">
      <div className="container mx-auto">
        {/* User Statistics Skeletons */}
        <section className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="p-4 border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black"
              >
                <div className="flex items-center">
                  <Skeleton className="h-10 w-10 rounded-full mr-4" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-6 w-12" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Search and Filters Skeleton */}
        <section className="mb-6">
          <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black">
            <div className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <Skeleton className="h-10 flex-1" />
                <div className="flex flex-wrap gap-3">
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-10 w-32" />
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* Users Table Skeleton */}
        <section className="mb-6">
          <Card className="border border-black/10 dark:border-white/10 shadow-sm bg-white dark:bg-black overflow-hidden">
            <div className="p-4 border-b border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-48" />
              </div>
            </div>
            <div className="p-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="py-3 border-b border-black/10 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-1" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-20" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-black/10 dark:border-white/10">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-8 w-64" />
              </div>
            </div>
          </Card>
        </section>
      </div>
    </div>
  )
}
