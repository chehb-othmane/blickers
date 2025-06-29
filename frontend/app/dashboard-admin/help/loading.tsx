import { Skeleton } from "@/components/ui/skeleton"

export default function HelpDocumentationLoading() {
  return (
    <div className="min-h-screen flex flex-col p-6 bg-neutral-white-100 dark:bg-black">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-8 w-64" />
        <div className="flex space-x-3">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-24 rounded-md" />
        </div>
      </div>

      {/* Search Bar Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-[120px] w-full rounded-md" />
      </div>

      {/* Quick Links Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[140px] w-full rounded-md" />
          ))}
        </div>
      </div>

      {/* Documentation Tabs Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-[400px] w-full rounded-md" />
      </div>

      {/* Contact Support Skeleton */}
      <div className="mb-8">
        <Skeleton className="h-8 w-40 mb-4" />
        <Skeleton className="h-[180px] w-full rounded-md" />
      </div>

      {/* Help Topics Skeleton */}
      <div>
        <Skeleton className="h-8 w-40 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-[200px] w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
