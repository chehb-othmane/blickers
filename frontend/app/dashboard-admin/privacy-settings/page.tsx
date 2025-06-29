"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, Lock, Eye, Globe, Users, Database, FileText, Search, History, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function PrivacySettingsPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  // Privacy settings state
  const [visibilitySettings, setVisibilitySettings] = useState({
    profileVisibility: "authenticated",
    emailVisibility: "staff",
    phoneVisibility: "private",
    activityVisibility: "authenticated",
  })

  const [dataSettings, setDataSettings] = useState({
    allowDataCollection: true,
    allowCookies: true,
    allowAnalytics: true,
    allowPersonalization: false,
    allowThirdPartySharing: false,
  })

  const toggleDataSetting = (key: keyof typeof dataSettings) => {
    setDataSettings((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="min-h-screen bg-neutral-white-100 dark:bg-black text-black dark:text-white theme-transition">
      {/* Header */}
      <header className="border-b bg-white dark:bg-black border-black/10 dark:border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Link
              href="/dashboard-admin/profile"
              className="flex items-center mr-4 font-medium text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Profile
            </Link>
            <h1 className="text-xl font-bold text-black dark:text-white">Privacy Settings</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Card className="border border-black/10 dark:border-white/10 bg-white dark:bg-black">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <Lock className="h-5 w-5 mr-2 text-orange-500" />
                <h2 className="text-lg font-semibold text-black dark:text-white">Privacy Settings</h2>
              </div>

              <Tabs defaultValue="visibility" className="w-full">
                <TabsList className="w-full mb-6 bg-black/5 dark:bg-white/5">
                  <TabsTrigger value="visibility" className="flex items-center">
                    <Eye className="h-4 w-4 mr-2" />
                    Visibility
                  </TabsTrigger>
                  <TabsTrigger value="data" className="flex items-center">
                    <Database className="h-4 w-4 mr-2" />
                    Data & Cookies
                  </TabsTrigger>
                  <TabsTrigger value="account" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Account
                  </TabsTrigger>
                </TabsList>

                {/* Visibility Tab */}
                <TabsContent value="visibility">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-4 text-black dark:text-white">Profile Visibility</h3>

                      <div className="space-y-4">
                        <div>
                          <p className="text-sm mb-2 text-black/70 dark:text-white/70">
                            Who can see your profile information?
                          </p>
                          <RadioGroup
                            value={visibilitySettings.profileVisibility}
                            onValueChange={(value) =>
                              setVisibilitySettings((prev) => ({ ...prev, profileVisibility: value }))
                            }
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="public" id="profile-public" />
                              <Label htmlFor="profile-public" className="text-black dark:text-white">
                                Public (Anyone)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="authenticated" id="profile-authenticated" />
                              <Label htmlFor="profile-authenticated" className="text-black dark:text-white">
                                Authenticated Users Only
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="staff" id="profile-staff" />
                              <Label htmlFor="profile-staff" className="text-black dark:text-white">
                                Staff Only
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="private" id="profile-private" />
                              <Label htmlFor="profile-private" className="text-black dark:text-white">
                                Private (Only You)
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <p className="text-sm mb-2 text-black/70 dark:text-white/70">
                            Who can see your email address?
                          </p>
                          <RadioGroup
                            value={visibilitySettings.emailVisibility}
                            onValueChange={(value) =>
                              setVisibilitySettings((prev) => ({ ...prev, emailVisibility: value }))
                            }
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="public" id="email-public" />
                              <Label htmlFor="email-public" className="text-black dark:text-white">
                                Public (Anyone)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="authenticated" id="email-authenticated" />
                              <Label htmlFor="email-authenticated" className="text-black dark:text-white">
                                Authenticated Users Only
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="staff" id="email-staff" />
                              <Label htmlFor="email-staff" className="text-black dark:text-white">
                                Staff Only
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="private" id="email-private" />
                              <Label htmlFor="email-private" className="text-black dark:text-white">
                                Private (Only You)
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <p className="text-sm mb-2 text-black/70 dark:text-white/70">
                            Who can see your phone number?
                          </p>
                          <RadioGroup
                            value={visibilitySettings.phoneVisibility}
                            onValueChange={(value) =>
                              setVisibilitySettings((prev) => ({ ...prev, phoneVisibility: value }))
                            }
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="public" id="phone-public" />
                              <Label htmlFor="phone-public" className="text-black dark:text-white">
                                Public (Anyone)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="authenticated" id="phone-authenticated" />
                              <Label htmlFor="phone-authenticated" className="text-black dark:text-white">
                                Authenticated Users Only
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="staff" id="phone-staff" />
                              <Label htmlFor="phone-staff" className="text-black dark:text-white">
                                Staff Only
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="private" id="phone-private" />
                              <Label htmlFor="phone-private" className="text-black dark:text-white">
                                Private (Only You)
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        <div>
                          <p className="text-sm mb-2 text-black/70 dark:text-white/70">
                            Who can see your activity history?
                          </p>
                          <RadioGroup
                            value={visibilitySettings.activityVisibility}
                            onValueChange={(value) =>
                              setVisibilitySettings((prev) => ({ ...prev, activityVisibility: value }))
                            }
                            className="space-y-2"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="public" id="activity-public" />
                              <Label htmlFor="activity-public" className="text-black dark:text-white">
                                Public (Anyone)
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="authenticated" id="activity-authenticated" />
                              <Label htmlFor="activity-authenticated" className="text-black dark:text-white">
                                Authenticated Users Only
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="staff" id="activity-staff" />
                              <Label htmlFor="activity-staff" className="text-black dark:text-white">
                                Staff Only
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="private" id="activity-private" />
                              <Label htmlFor="activity-private" className="text-black dark:text-white">
                                Private (Only You)
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Data & Cookies Tab */}
                <TabsContent value="data">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-4 text-black dark:text-white">Data Collection & Cookies</h3>

                      <div className="space-y-4">
                        <PrivacyToggleItem
                          icon={Database}
                          title="Allow Data Collection"
                          description="Allow us to collect data about how you use the platform to improve our services"
                          checked={dataSettings.allowDataCollection}
                          onCheckedChange={() => toggleDataSetting("allowDataCollection")}
                        />

                        <PrivacyToggleItem
                          icon={FileText}
                          title="Allow Cookies"
                          description="Allow us to store cookies on your device for better user experience"
                          checked={dataSettings.allowCookies}
                          onCheckedChange={() => toggleDataSetting("allowCookies")}
                        />

                        <PrivacyToggleItem
                          icon={Search}
                          title="Allow Analytics"
                          description="Allow us to analyze your usage patterns to improve our platform"
                          checked={dataSettings.allowAnalytics}
                          onCheckedChange={() => toggleDataSetting("allowAnalytics")}
                        />

                        <PrivacyToggleItem
                          icon={Users}
                          title="Allow Personalization"
                          description="Allow us to personalize your experience based on your preferences"
                          checked={dataSettings.allowPersonalization}
                          onCheckedChange={() => toggleDataSetting("allowPersonalization")}
                        />

                        <PrivacyToggleItem
                          icon={Globe}
                          title="Allow Third-Party Data Sharing"
                          description="Allow us to share your data with trusted third parties"
                          checked={dataSettings.allowThirdPartySharing}
                          onCheckedChange={() => toggleDataSetting("allowThirdPartySharing")}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6 border-black/10 dark:border-white/10">
                      <h3 className="font-medium mb-4 text-black dark:text-white">Data Management</h3>

                      <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="font-medium text-black dark:text-white">Download Your Data</p>
                            <p className="text-sm text-black/50 dark:text-white/50">
                              Download a copy of all your personal data
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            Download Data
                          </Button>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <p className="font-medium text-black dark:text-white">Clear Browsing History</p>
                            <p className="text-sm text-black/50 dark:text-white/50">
                              Clear your browsing history on this platform
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            className="border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5"
                          >
                            <History className="h-4 w-4 mr-2" />
                            Clear History
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Account Tab */}
                <TabsContent value="account">
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-medium mb-4 text-black dark:text-white">Account Privacy</h3>

                      <div className="space-y-4">
                        <PrivacyToggleItem
                          icon={Eye}
                          title="Show Online Status"
                          description="Allow others to see when you're online"
                          checked={true}
                          onCheckedChange={() => {}}
                        />

                        <PrivacyToggleItem
                          icon={Users}
                          title="Allow Friend Requests"
                          description="Allow other users to send you connection requests"
                          checked={true}
                          onCheckedChange={() => {}}
                        />

                        <PrivacyToggleItem
                          icon={Search}
                          title="Appear in Search Results"
                          description="Allow your profile to appear in search results"
                          checked={true}
                          onCheckedChange={() => {}}
                        />
                      </div>
                    </div>

                    <div className="border-t pt-6 border-black/10 dark:border-white/10">
                      <h3 className="font-medium mb-4 text-red-500">Danger Zone</h3>

                      <div className="space-y-4">
                        <div className="p-4 rounded-md border border-red-500/30 bg-red-500/5">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                              <p className="font-medium text-red-500">Delete Account</p>
                              <p className="text-sm text-black/50 dark:text-white/50">
                                Permanently delete your account and all associated data
                              </p>
                            </div>
                            <Button
                              variant="destructive"
                              onClick={() => setShowDeleteConfirm(true)}
                              className="hover:bg-red-600 transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Account
                            </Button>
                          </div>

                          {showDeleteConfirm && (
                            <Alert className="mt-4 bg-red-500/10 text-red-500 border-red-500/30">
                              <AlertDescription className="flex flex-col space-y-4">
                                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                                <div className="flex space-x-2 justify-end">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="border-black/10 dark:border-white/10 hover:bg-black/10 dark:hover:bg-white/10 transition-colors duration-200"
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    className="hover:bg-red-600 transition-colors duration-200"
                                  >
                                    Confirm Delete
                                  </Button>
                                </div>
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 pt-6 border-t flex justify-end border-black/10 dark:border-white/10">
                <Button className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90 transition-opacity duration-200">
                  Save Privacy Settings
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

function PrivacyToggleItem({
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
      <Switch checked={checked} onCheckedChange={onCheckedChange} className={checked ? "bg-orange-500" : ""} />
    </div>
  )
}
