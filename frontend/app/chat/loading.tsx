import { Skeleton } from "@/components/ui/skeleton"
import { Card } from "@/components/ui/card"
import { Navigation } from "@/components/navigation"

export default function ChatLoading() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      <div className="pt-20 h-[calc(100vh-80px)] max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="h-full border border-black/10 shadow-[0_2px_10px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="flex h-full">
            {/* Chat List Sidebar */}
            <div className="w-1/3 border-r border-black/10 flex flex-col bg-white">
              {/* Header */}
              <div className="p-4 border-b border-black/10 flex items-center justify-between bg-white">
                <Skeleton className="h-7 w-32" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>

              {/* Search */}
              <div className="p-4 border-b border-black/10">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Tabs */}
              <div className="px-4 pt-2">
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              {/* Chat List */}
              <div className="flex-1 overflow-y-auto">
                <div className="p-4 flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-24 mb-2" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
                <div className="p-4 flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>
                <div className="p-4 flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-28 mb-2" />
                    <Skeleton className="h-4 w-44" />
                  </div>
                </div>
                <div className="p-4 flex items-center space-x-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-36 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-black/10 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div>
                    <Skeleton className="h-5 w-32 mb-1" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 bg-black/5">
                <div className="space-y-4">
                  <div className="flex justify-start">
                    <Skeleton className="h-16 w-64 rounded-2xl rounded-bl-none" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-12 w-48 rounded-2xl rounded-br-none" />
                  </div>
                  <div className="flex justify-start">
                    <Skeleton className="h-24 w-72 rounded-2xl rounded-bl-none" />
                  </div>
                  <div className="flex justify-end">
                    <Skeleton className="h-16 w-56 rounded-2xl rounded-br-none" />
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-black/10 bg-white">
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-10 flex-1 rounded-md" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
