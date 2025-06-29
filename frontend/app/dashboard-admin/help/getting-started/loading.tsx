import { Skeleton } from "@/components/ui/skeleton"

export default function GettingStartedLoading() {
  return (
    <div className="min-h-screen bg-neutral-white-100 dark:bg-black p-6">
      <div className="container mx-auto">
        {/* Welcome Section Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>

        {/* Dashboard Overview Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>

        {/* First Steps Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
        </div>

        {/* Key Features Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-8 w-64 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[200px] rounded-lg" />
            <Skeleton className="h-[200px] rounded-lg" />
          </div>
        </div>

        {/* Help Resources Skeleton */}
        <div>
          <Skeleton className="h-8 w-64 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
