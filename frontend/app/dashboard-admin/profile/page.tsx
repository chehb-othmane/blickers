"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import ReactCrop, { type Crop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Globe,
  Edit3,
  Save,
  X,
  Camera,
  Shield,
  Key,
  Bell,
  Lock,
  Settings,
  MessageSquare,
  FileText,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { profileApi, type UserProfile } from "@/services/api"
import { toast } from "sonner"

export default function ProfilePage() {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
    location: "",
    birthday: "",
    role: "",
    department: "",
    joinDate: "",
    bio: "",
    website: "",
    education: "",
    languages: [],
    profile_picture: null,
  })
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 90,
    height: 90,
    x: 5,
    y: 5
  })
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [showCropModal, setShowCropModal] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const data = await profileApi.getProfile()
      setProfile(data)
    } catch (error) {
      toast.error("Failed to load profile data")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      // Format the birthday date if it exists
      const formattedProfile = {
        ...profile,
        birthday: profile.birthday ? new Date(profile.birthday).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }) : ''
      }
      await profileApi.updateProfile(formattedProfile)
      toast.success("Profile updated successfully")
      setEditing(false)
    } catch (error) {
      toast.error("Failed to update profile")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImageSrc(reader.result as string)
        setShowCropModal(true)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCropComplete = async (croppedArea: Crop) => {
    if (!imgRef.current || !imageSrc) return

    const image = imgRef.current
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height
    canvas.width = croppedArea.width
    canvas.height = croppedArea.height
    const ctx = canvas.getContext('2d')

    if (!ctx) return

    ctx.drawImage(
      image,
      croppedArea.x * scaleX,
      croppedArea.y * scaleY,
      croppedArea.width * scaleX,
      croppedArea.height * scaleY,
      0,
      0,
      croppedArea.width,
      croppedArea.height
    )

    // Convert canvas to blob
    canvas.toBlob(async (blob) => {
      if (!blob) return

      try {
        setLoading(true)
        const response = await profileApi.updateProfilePicture(blob)
        setProfile(prev => ({ ...prev, profile_picture: response.profile_picture }))
        toast.success('Profile picture updated successfully')
      } catch (error) {
        console.error('Error uploading image:', error)
        toast.error('Failed to update profile picture')
      } finally {
        setLoading(false)
        setShowCropModal(false)
        setImageSrc(null)
      }
    }, 'image/jpeg', 0.95)
  }

  if (loading && !profile.name) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-neutral-white-100 dark:bg-black text-black dark:text-white theme-transition">
      <div className="relative">
        <div className="container mx-auto py-8 px-4">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Profile Info */}
            <div className="md:w-1/3">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                <Card className="p-6 border relative border-black/10 dark:border-white/10 bg-white dark:bg-black">
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <Avatar className="h-32 w-32 border-4 border-orange-500">
                        <AvatarImage 
                          src={profile.profile_picture || "/placeholder.svg?height=128&width=128"} 
                          alt={profile.name}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder.svg?height=128&width=128";
                          }}
                        />
                        <AvatarFallback className="bg-orange-500 text-white text-4xl">
                          {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0">
                        <input
                          type="file"
                          id="profile-image-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleImageUpload}
                        />
                        <Button
                          size="icon"
                          className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                          onClick={() => document.getElementById('profile-image-upload')?.click()}
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <h1 className="text-2xl font-bold mt-4 text-black dark:text-white">{profile.name}</h1>
                    <Badge
                      variant="outline"
                      className="bg-gradient-to-r from-orange-400 to-orange-600 text-white border-orange-500/20 mt-2"
                    >
                      {profile.role}
                    </Badge>

                    <div className="w-full mt-6 space-y-4">
                      <ProfileItem icon={Mail} label="Email" value={profile.email} />
                      <ProfileItem icon={Phone} label="Phone" value={profile.phone} />
                      <ProfileItem icon={MapPin} label="Location" value={profile.location} />
                      <ProfileItem icon={Calendar} label="Birthday" value={profile.birthday} />
                      <ProfileItem icon={Briefcase} label="Department" value={profile.department} />
                      <ProfileItem icon={Calendar} label="Joined" value={profile.joinDate} />
                      <ProfileItem icon={GraduationCap} label="Education" value={profile.education} />
                      <ProfileItem icon={Globe} label="Website" value={profile.website} isLink />
                    </div>

                    <div className="w-full mt-6">
                      <h3 className="text-sm font-medium mb-2 text-black/70 dark:text-white/70">Languages</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.languages.map((lang, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="bg-black/5 dark:bg-white/5 text-black/70 dark:text-white/70 border-black/10"
                          >
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="p-6 border mt-6 border-black/10 dark:border-white/10 bg-white dark:bg-black">
                  <h3 className="text-lg font-medium mb-4 text-black dark:text-white">Account Security</h3>
                  <div className="space-y-4">
                    <Link href="/dashboard-admin/change-password" className="block w-full">
                      <Button
                        variant="outline"
                        className="w-full justify-start cursor-pointer border-black/10 hover:bg-black/10 transition-colors duration-200"
                      >
                        <Key className="h-4 w-4 mr-2 text-black/70 dark:text-white/70" />
                        <span className="text-black dark:text-white">Change Password</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard-admin/two-factor-auth" className="block w-full">
                      <Button variant="outline" className="w-full justify-start cursor-pointer">
                        <Shield className="h-4 w-4 mr-2 text-black/70 dark:text-white/70" />
                        <span className="text-black dark:text-white">Two-Factor Authentication</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard-admin/notification-preferences" className="block w-full">
                      <Button variant="outline" className="w-full justify-start cursor-pointer">
                        <Bell className="h-4 w-4 mr-2 text-black/70 dark:text-white/70" />
                        <span className="text-black dark:text-white">Notification Preferences</span>
                      </Button>
                    </Link>
                    <Link href="/dashboard-admin/privacy-settings" className="block w-full">
                      <Button variant="outline" className="w-full justify-start cursor-pointer">
                        <Lock className="h-4 w-4 mr-2 text-black/70 dark:text-white/70" />
                        <span className="text-black dark:text-white">Privacy Settings</span>
                      </Button>
                    </Link>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Right Column - Bio and Activity */}
            <div className="md:w-2/3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <Card className="p-6 border border-black/10 dark:border-white/10 bg-white dark:bg-black">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-black dark:text-white">About Me</h2>
                    {editing ? (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-black/70 dark:text-white/70 hover:text-black hover:bg-black/10 transition-colors duration-200"
                          onClick={() => setEditing(false)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleSave}
                          disabled={loading}
                          className="bg-gradient-to-r from-orange-400 to-orange-600 text-white hover:opacity-90"
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-black/10 hover:bg-black/10 transition-colors duration-200"
                        onClick={() => setEditing(true)}
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium block mb-1 text-black/70 dark:text-white/70">
                          Full Name
                        </label>
                        <Input name="name" value={profile.name} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1 text-black/70 dark:text-white/70">Email</label>
                        <Input name="email" value={profile.email} onChange={handleChange} />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium block mb-1 text-black/70 dark:text-white/70">
                            Phone
                          </label>
                          <Input name="phone" value={profile.phone} onChange={handleChange} />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1 text-black/70 dark:text-white/70">
                            Location
                          </label>
                          <Input name="location" value={profile.location} onChange={handleChange} />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium block mb-1 text-black/70 dark:text-white/70">
                            Birthday
                          </label>
                          <Input 
                            type="date" 
                            name="birthday" 
                            value={profile.birthday ? new Date(profile.birthday).toISOString().split('T')[0] : ''} 
                            onChange={handleChange} 
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium block mb-1 text-black/70 dark:text-white/70">
                            Department
                          </label>
                          <Input name="department" value={profile.department} onChange={handleChange} />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1 text-black/70 dark:text-white/70">
                          Education
                        </label>
                        <Input name="education" value={profile.education} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1 text-black/70 dark:text-white/70">
                          Website
                        </label>
                        <Input name="website" value={profile.website} onChange={handleChange} />
                      </div>
                      <div>
                        <label className="text-sm font-medium block mb-1 text-black/70 dark:text-white/70">Bio</label>
                        <Textarea name="bio" value={profile.bio} onChange={handleChange} rows={5} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-base leading-relaxed text-black/80 dark:text-white/80">{profile.bio}</p>
                  )}
                </Card>

                <Card className="p-6 border mt-6 border-black/10 dark:border-white/10 bg-white dark:bg-black">
                  <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Recent Activity</h2>
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-black/10">
                    {[
                      { action: "Updated system settings", time: "Today at 10:30 AM", type: "settings" },
                      {
                        action: "Created new event: Annual Hackathon 2025",
                        time: "Yesterday at 2:15 PM",
                        type: "event",
                      },
                      { action: "Approved 5 new user registrations", time: "Yesterday at 11:20 AM", type: "user" },
                      { action: "Resolved reported forum post #1234", time: "May 1, 2025 at 3:45 PM", type: "forum" },
                      {
                        action: "Updated privacy policy document",
                        time: "April 28, 2025 at 9:15 AM",
                        type: "document",
                      },
                    ].map((activity, index) => (
                      <div key={index} className="flex pl-8 relative">
                        <div
                          className={cn(
                            "absolute left-0 top-1 h-6 w-6 rounded-full flex items-center justify-center bg-white",
                            activity.type === "settings"
                              ? "text-orange-500"
                              : activity.type === "event"
                                ? "text-[#6262cf]"
                                : activity.type === "user"
                                  ? "text-[#99c805]"
                                  : activity.type === "forum"
                                    ? "text-red-500"
                                    : "text-blue-500",
                          )}
                        >
                          {activity.type === "settings" && <Settings className="h-3 w-3" />}
                          {activity.type === "event" && <Calendar className="h-3 w-3" />}
                          {activity.type === "user" && <User className="h-3 w-3" />}
                          {activity.type === "forum" && <MessageSquare className="h-3 w-3" />}
                          {activity.type === "document" && <FileText className="h-3 w-3" />}
                        </div>
                        <div>
                          <p className="font-medium text-black dark:text-white">{activity.action}</p>
                          <p className="text-sm text-black/60 dark:text-white/60">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-6 border mt-6 border-black/10 dark:border-white/10 bg-white dark:bg-black">
                  <h2 className="text-xl font-bold mb-4 text-black dark:text-white">Permissions</h2>
                  <div className="space-y-3">
                    {[
                      { name: "User Management", description: "Create, edit, and delete user accounts", granted: true },
                      {
                        name: "Content Management",
                        description: "Create, edit, and delete content across the platform",
                        granted: true,
                      },
                      { name: "Event Management", description: "Create, edit, and delete events", granted: true },
                      {
                        name: "Financial Management",
                        description: "Access to financial data and transactions",
                        granted: true,
                      },
                      {
                        name: "System Configuration",
                        description: "Modify system settings and configurations",
                        granted: true,
                      },
                      { name: "API Access", description: "Access to system APIs and integrations", granted: false },
                    ].map((permission, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-md flex items-center justify-between bg-black/5 dark:bg-white/5"
                      >
                        <div>
                          <p className="font-medium text-black dark:text-white">{permission.name}</p>
                          <p className="text-sm text-black/60 dark:text-white/60">{permission.description}</p>
                        </div>
                        <Badge
                          className={
                            permission.granted
                              ? "bg-green-500/20 text-green-500 border-green-500/30"
                              : "bg-red-500/20 text-red-500 border-red-500/30"
                          }
                        >
                          {permission.granted ? "Granted" : "Denied"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modal */}
      {showCropModal && imageSrc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-black p-6 rounded-lg max-w-lg w-full">
            <h3 className="text-lg font-semibold mb-4">Crop Profile Picture</h3>
            <div className="mb-4">
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={1}
                className="max-h-[400px]"
              >
                <img
                  ref={imgRef}
                  src={imageSrc}
                  alt="Crop preview"
                  className="max-w-full"
                />
              </ReactCrop>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCropModal(false)
                  setImageSrc(null)
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleCropComplete(crop)}
                className="bg-orange-500 hover:bg-orange-600 text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileItem({
  icon: Icon,
  label,
  value,
  isLink = false,
}: {
  icon: React.ElementType
  label: string
  value: string
  isLink?: boolean
}) {
  return (
    <div className="flex items-start">
      <div className="p-2 rounded-full mr-3 bg-black/5 dark:bg-white/5">
        <Icon className="h-4 w-4 text-black/70 dark:text-white/70" />
      </div>
      <div>
        <p className="text-xs text-black/50 dark:text-white/50">{label}</p>
        {isLink ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline text-orange-500">
            {value}
          </a>
        ) : (
          <p className="text-sm text-black dark:text-white">{value}</p>
        )}
      </div>
    </div>
  )
}
