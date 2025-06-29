"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import {
  ChevronLeft,
  Bell,
  Mail,
  Smartphone,
  Globe,
  MessageSquare,
  Calendar,
  FileText,
  Users,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export default function NotificationPreferencesPage() {
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the UI that depends on the theme
  useState(() => {
    setMounted(true)
  })

  // Notification settings state
  const [emailSettings, setEmailSettings] = useState({
    systemUpdates: true,
    accountActivity: true,
    newUsers: false,
    contentUpdates: true,
    events: true,
    forumActivity: false,
    marketing: false,
  })

  const [pushSettings, setPushSettings] = useState({
    systemUpdates: true,
    accountActivity: true,
    newUsers: true,
    contentUpdates: false,
    events: true,
    forumActivity: true,
    marketing: false,
  })

  const [smsSettings, setSmsSettings] = useState({
    systemUpdates: false,
    accountActivity: false,
    newUsers: false,
    contentUpdates: false,
    events: false,
    forumActivity: false,
    marketing: false,
  })

  const [emailFrequency, setEmailFrequency] = useState("daily")

  const toggleEmailSetting = (key: keyof typeof emailSettings) => {
    setEmailSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const togglePushSetting = (key: keyof typeof pushSettings) => {
    setPushSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleSmsSetting = (key: keyof typeof smsSettings) => {
    setSmsSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-neutral-white-100 dark:bg-black text-black dark:text-white theme-transition">
      {/* Header */}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border border-black/10 dark:border-white/10 bg-white dark:bg-black">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Bell className="h-5 w-5 mr-2 text-orange-500" />
                <h2 className="text-lg font-semibold text-black dark:text-white">Notification Settings</h2>
              </div>

              <Tabs defaultValue="email" className="w-full">
                <TabsList className="w-full mb-6 bg-black/5 dark:bg-white/5">
                  <TabsTrigger value="email" className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </TabsTrigger>
                  <TabsTrigger value="push" className="flex items-center">
                    <Globe className="h-4 w-4 mr-2" />
                    Push
                  </TabsTrigger>
                </TabsList>

                {/* Email Notifications Tab */}
                <TabsContent value="email">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-black dark:text-white">Email Frequency</h3>
                        <p className="text-sm text-black/50 dark:text-white/50">
                          Choose how often you want to receive email notifications
                        </p>
                      </div>
                    </div>

                    <RadioGroup
                      value={emailFrequency}
                      onValueChange={setEmailFrequency}
                      className="flex flex-col space-y-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="realtime" id="realtime" />
                        <Label htmlFor="realtime" className="text-black dark:text-white">
                          Real-time
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="daily" id="daily" />
                        <Label htmlFor="daily" className="text-black dark:text-white">
                          Daily digest
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="weekly" id="weekly" />
                        <Label htmlFor="weekly" className="text-black dark:text-white">
                          Weekly digest
                        </Label>
                      </div>
                    </RadioGroup>

                    <div className="border-t pt-6 border-black/10 dark:border-white/10">
                      <h3 className="font-medium mb-4 text-black dark:text-white">Email Notifications</h3>

                      <div className="space-y-4">
                        <NotificationItem
                          icon={Info}
                          title="System Updates"
                          description="Important announcements and system updates"
                          checked={emailSettings.systemUpdates}
                          onCheckedChange={() => toggleEmailSetting("systemUpdates")}
                        />

                        <NotificationItem
                          icon={Users}
                          title="Account Activity"
                          description="Login alerts and account changes"
                          checked={emailSettings.accountActivity}
                          onCheckedChange={() => toggleEmailSetting("accountActivity")}
                        />

                        <NotificationItem
                          icon={Users}
                          title="New User Registrations"
                          description="Notifications when new users register"
                          checked={emailSettings.newUsers}
                          onCheckedChange={() => toggleEmailSetting("newUsers")}
                        />

                        <NotificationItem
                          icon={FileText}
                          title="Content Updates"
                          description="New content and content changes"
                          checked={emailSettings.contentUpdates}
                          onCheckedChange={() => toggleEmailSetting("contentUpdates")}
                        />

                        <NotificationItem
                          icon={Calendar}
                          title="Events"
                          description="Event reminders and updates"
                          checked={emailSettings.events}
                          onCheckedChange={() => toggleEmailSetting("events")}
                        />

                        <NotificationItem
                          icon={MessageSquare}
                          title="Forum Activity"
                          description="Replies to your posts and forum mentions"
                          checked={emailSettings.forumActivity}
                          onCheckedChange={() => toggleEmailSetting("forumActivity")}
                        />

                        <NotificationItem
                          icon={Mail}
                          title="Marketing"
                          description="Newsletters and promotional content"
                          checked={emailSettings.marketing}
                          onCheckedChange={() => toggleEmailSetting("marketing")}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Push Notifications Tab */}
                <TabsContent value="push">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-black dark:text-white">Push Notifications</h3>
                        <p className="text-sm text-black/50 dark:text-white/50">
                          Configure browser and mobile push notifications
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <NotificationItem
                        icon={Info}
                        title="System Updates"
                        description="Important announcements and system updates"
                        checked={pushSettings.systemUpdates}
                        onCheckedChange={() => togglePushSetting("systemUpdates")}
                      />

                      <NotificationItem
                        icon={Users}
                        title="Account Activity"
                        description="Login alerts and account changes"
                        checked={pushSettings.accountActivity}
                        onCheckedChange={() => togglePushSetting("accountActivity")}
                      />

                      <NotificationItem
                        icon={Users}
                        title="New User Registrations"
                        description="Notifications when new users register"
                        checked={pushSettings.newUsers}
                        onCheckedChange={() => togglePushSetting("newUsers")}
                      />

                      <NotificationItem
                        icon={FileText}
                        title="Content Updates"
                        description="New content and content changes"
                        checked={pushSettings.contentUpdates}
                        onCheckedChange={() => togglePushSetting("contentUpdates")}
                      />

                      <NotificationItem
                        icon={Calendar}
                        title="Events"
                        description="Event reminders and updates"
                        checked={pushSettings.events}
                        onCheckedChange={() => togglePushSetting("events")}
                      />

                      <NotificationItem
                        icon={MessageSquare}
                        title="Forum Activity"
                        description="Replies to your posts and forum mentions"
                        checked={pushSettings.forumActivity}
                        onCheckedChange={() => togglePushSetting("forumActivity")}
                      />

                      <NotificationItem
                        icon={Mail}
                        title="Marketing"
                        description="Newsletters and promotional content"
                        checked={pushSettings.marketing}
                        onCheckedChange={() => togglePushSetting("marketing")}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 pt-6 border-t flex justify-end">
                <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90 transition-opacity duration-200">
                  Save Preferences
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function NotificationItem({
  icon: Icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ElementType
  title: string
  description: string
  checked: boolean
  onCheckedChange: () => void
}) {
  return (
    <div className="p-3 rounded-md flex items-center justify-between bg-black/5 dark:bg-white/5">
      <div className="flex items-center">
        <div className="p-2 rounded-full mr-3 bg-black/10 dark:bg-white/10">
          <Icon className="h-4 w-4 text-black/70 dark:text-white/70" />
        </div>
        <div>
          <p className="font-medium text-black dark:text-white">{title}</p>
          <p className="text-sm text-black/50 dark:text-white/50">{description}</p>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onCheckedChange}
        className={checked ? "bg-orange-500 hover:bg-orange-600 transition-colors duration-200" : ""}
      />
    </div>
  )
}
