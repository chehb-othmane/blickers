import { Skeleton } from "@/components/ui/skeleton"

export default function EventsLoading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <div className="flex justify-between items-center mb-6">
              <Skeleton className="h-8 w-36" />
              <div className="flex space-x-2">
                <Skeleton className="h-9 w-24" />
                <Skeleton className="h-9 w-24" />
              </div>
            </div>

            <div className="space-y-4">
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <div key={i} className="border rounded-md p-4">
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-6 w-48" />
                      <div className="flex space-x-2">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-8 w-20" />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-5 w-full" />
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex items-center justify-between mt-6">
              <Skeleton className="h-5 w-32" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-1">
          <div className="bg-card rounded-lg border shadow-sm p-6 space-y-6">
            <Skeleton className="h-7 w-32" />
            <div className="space-y-4">
              <Skeleton className="h-[300px] w-full rounded-md" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
