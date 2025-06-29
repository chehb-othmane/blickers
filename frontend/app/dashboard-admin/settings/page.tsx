"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Lock, Shield, Smartphone, Mail, Eye, EyeOff, Save, RefreshCw, AlertTriangle, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SettingsPage() {
  const [saveSuccess, setSaveSuccess] = useState<boolean | null>(null)

  const [settings, setSettings] = useState({
    // Appearance
    theme: "system",
    fontSize: 16,
    animationsEnabled: true,

    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    eventReminders: true,
    messageAlerts: true,
    systemUpdates: true,

    // Privacy
    profileVisibility: "public",
    activityTracking: true,
    dataSharing: false,

    // Security
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: 30,
  })

  const handleSwitchChange = (name: string) => {
    setSettings((prev) => ({ ...prev, [name]: !prev[name as keyof typeof prev] }))
  }

  const handleRadioChange = (name: string, value: string) => {
    setSettings((prev) => ({ ...prev, [name]: value }))
  }

  const handleSliderChange = (name: string, value: number[]) => {
    setSettings((prev) => ({ ...prev, [name]: value[0] }))
  }

  const handleSave = () => {
    // Simulate saving settings
    setSaveSuccess(true)
    setTimeout(() => {
      setSaveSuccess(null)
    }, 3000)
  }

  const handleReset = () => {
    // Simulate error
    setSaveSuccess(false)
    setTimeout(() => {
      setSaveSuccess(null)
    }, 3000)
  }

  return (
    <div className="min-h-screen bg-neutral-white-100 dark:bg-black text-black dark:text-white theme-transition">
      <div className="relative">
        <div className="container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-black dark:text-white">Settings</h1>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-black/10 hover:bg-black/10 transition-colors duration-200"
                    onClick={handleReset}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button
                    className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90 transition-opacity duration-200"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </div>

              {saveSuccess === true && (
                <div className="mb-6 bg-green-500/10 border-l-4 border-green-500 p-4 rounded-r-md">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-600">Settings saved successfully!</p>
                  </div>
                </div>
              )}

              {saveSuccess === false && (
                <div className="mb-6 bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-md">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-red-600">An error occurred while saving settings. Please try again.</p>
                  </div>
                </div>
              )}

              <Tabs defaultValue="notifications" className="w-full">
                <TabsList className="grid grid-cols-3 mb-6 bg-black/5 dark:bg-white/5">
                  <TabsTrigger value="notifications">Notifications</TabsTrigger>
                  <TabsTrigger value="privacy">Privacy</TabsTrigger>
                  <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>

                <TabsContent value="notifications">
                  <Card className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-black">
                    <h2 className="text-xl font-bold mb-6 text-black dark:text-white">Notification Settings</h2>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center">
                            <Mail className="h-4 w-4 mr-2 text-black/70 dark:text-white/70" />
                            <span>Email Notifications</span>
                          </Label>
                          <p className="text-sm text-black/50 dark:text-white/50">Receive notifications via email</p>
                        </div>
                        <Switch
                          checked={settings.emailNotifications}
                          onCheckedChange={() => handleSwitchChange("emailNotifications")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center">
                            <Smartphone className="h-4 w-4 mr-2 text-black/70 dark:text-white/70" />
                            <span>Push Notifications</span>
                          </Label>
                          <p className="text-sm text-black/50 dark:text-white/50">
                            Receive push notifications on your devices
                          </p>
                        </div>
                        <Switch
                          checked={settings.pushNotifications}
                          onCheckedChange={() => handleSwitchChange("pushNotifications")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Event Reminders</Label>
                          <p className="text-sm text-black/50 dark:text-white/50">
                            Receive reminders about upcoming events
                          </p>
                        </div>
                        <Switch
                          checked={settings.eventReminders}
                          onCheckedChange={() => handleSwitchChange("eventReminders")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Message Alerts</Label>
                          <p className="text-sm text-black/50 dark:text-white/50">Receive alerts for new messages</p>
                        </div>
                        <Switch
                          checked={settings.messageAlerts}
                          onCheckedChange={() => handleSwitchChange("messageAlerts")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>System Updates</Label>
                          <p className="text-sm text-black/50 dark:text-white/50">
                            Receive notifications about system updates and maintenance
                          </p>
                        </div>
                        <Switch
                          checked={settings.systemUpdates}
                          onCheckedChange={() => handleSwitchChange("systemUpdates")}
                        />
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="privacy">
                  <Card className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-black">
                    <h2 className="text-xl font-bold mb-6 text-black dark:text-white">Privacy Settings</h2>

                    <div className="space-y-6">
                      <div>
                        <h3 className="text-base font-medium mb-4 text-black dark:text-white">Profile Visibility</h3>
                        <RadioGroup
                          defaultValue={settings.profileVisibility}
                          onValueChange={(value) => handleRadioChange("profileVisibility", value)}
                          className="flex flex-col space-y-2"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="public" id="visibility-public" />
                            <Label htmlFor="visibility-public" className="flex items-center">
                              <Eye className="h-4 w-4 mr-2 text-black/70 dark:text-white/70" />
                              <span>Public</span>
                              <span className="text-xs ml-2 text-black/50 dark:text-white/50">
                                (Visible to everyone)
                              </span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="members" id="visibility-members" />
                            <Label htmlFor="visibility-members" className="flex items-center">
                              <Eye className="h-4 w-4 mr-2 text-black/70 dark:text-white/70" />
                              <span>Members Only</span>
                              <span className="text-xs ml-2 text-black/50 dark:text-white/50">
                                (Visible to registered users)
                              </span>
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="private" id="visibility-private" />
                            <Label htmlFor="visibility-private" className="flex items-center">
                              <EyeOff className="h-4 w-4 mr-2 text-black/70 dark:text-white/70" />
                              <span>Private</span>
                              <span className="text-xs ml-2 text-black/50 dark:text-white/50">
                                (Visible only to you and admins)
                              </span>
                            </Label>
                          </div>
                        </RadioGroup>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Activity Tracking</Label>
                          <p className="text-sm text-black/50 dark:text-white/50">
                            Allow the system to track your activity for personalized experiences
                          </p>
                        </div>
                        <Switch
                          checked={settings.activityTracking}
                          onCheckedChange={() => handleSwitchChange("activityTracking")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Data Sharing</Label>
                          <p className="text-sm text-black/50 dark:text-white/50">
                            Allow anonymous usage data to be shared for platform improvement
                          </p>
                        </div>
                        <Switch
                          checked={settings.dataSharing}
                          onCheckedChange={() => handleSwitchChange("dataSharing")}
                        />
                      </div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="security">
                  <Card className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-black">
                    <h2 className="text-xl font-bold mb-6 text-black dark:text-white">Security Settings</h2>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="flex items-center">
                            <Shield className="h-4 w-4 mr-2 text-black/70 dark:text-white/70" />
                            <span>Two-Factor Authentication</span>
                          </Label>
                          <p className="text-sm text-black/50 dark:text-white/50">
                            Add an extra layer of security to your account
                          </p>
                        </div>
                        <Switch
                          checked={settings.twoFactorAuth}
                          onCheckedChange={() => handleSwitchChange("twoFactorAuth")}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label>Login Alerts</Label>
                          <p className="text-sm text-black/50 dark:text-white/50">
                            Receive alerts for new login attempts
                          </p>
                        </div>
                        <Switch
                          checked={settings.loginAlerts}
                          onCheckedChange={() => handleSwitchChange("loginAlerts")}
                        />
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-base font-medium text-black dark:text-white">Session Timeout</h3>
                          <span className="text-sm text-black/70 dark:text-white/70">
                            {settings.sessionTimeout} minutes
                          </span>
                        </div>
                        <Slider
                          defaultValue={[settings.sessionTimeout]}
                          min={5}
                          max={120}
                          step={5}
                          onValueChange={(value) => handleSliderChange("sessionTimeout", value)}
                        />
                        <div className="flex justify-between mt-2">
                          <span className="text-xs text-black/50 dark:text-white/50">5 min</span>
                          <span className="text-xs text-black/50 dark:text-white/50">2 hours</span>
                        </div>
                      </div>

                      <div className="pt-4">
                        <Button
                          variant="outline"
                          className="w-full border-black/10 hover:bg-black/10 transition-colors duration-200"
                        >
                          <Lock className="h-4 w-4 mr-2" />
                          Change Password
                        </Button>
                      </div>
                    </div>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
