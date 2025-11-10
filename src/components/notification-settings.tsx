"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Bell, 
  BellOff, 
  Settings, 
  Clock, 
  Target, 
  Award, 
  Users, 
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useNotifications } from "@/hooks/use-notifications"

export function NotificationSettings() {
  const {
    permission,
    pushSupported,
    notificationsEnabled,
    preferences,
    loading,
    requestPermission,
    toggleNotifications,
    updatePreferences,
    sendTestNotification
  } = useNotifications()

  const [localPreferences, setLocalPreferences] = useState(preferences)
  const [hasChanges, setHasChanges] = useState(false)

  const handlePreferenceChange = (key: string, value: any) => {
    const newPreferences = { ...localPreferences }
    
    if (key.includes('.')) {
      const [parent, child] = key.split('.')
      newPreferences[parent] = { ...newPreferences[parent], [child]: value }
    } else {
      newPreferences[key] = value
    }
    
    setLocalPreferences(newPreferences)
    setHasChanges(true)
  }

  const handleSavePreferences = async () => {
    await updatePreferences(localPreferences)
    setHasChanges(false)
  }

  const handleEnableNotifications = async () => {
    const success = await requestPermission()
    if (success) {
      // Send test notification
      setTimeout(() => sendTestNotification(), 1000)
    }
  }

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { color: 'bg-green-100 text-green-800', text: 'Granted' }
      case 'denied':
        return { color: 'bg-red-100 text-red-800', text: 'Denied' }
      default:
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Not Set' }
    }
  }

  const permissionStatus = getPermissionStatus()

  if (!pushSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BellOff className="w-5 h-5 mr-2 text-red-600" />
            Notifications Not Supported
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">
            Your browser does not support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Notification Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Manage your notification preferences and delivery settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-medium">Push Notifications</span>
                <Badge variant={permissionStatus.color as any}>
                  {permissionStatus.text}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {permission === 'granted' 
                  ? 'Notifications are enabled for this app'
                  : 'Enable notifications to receive learning reminders and updates'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {permission === 'granted' ? (
                <Switch
                  checked={notificationsEnabled}
                  onCheckedChange={toggleNotifications}
                  disabled={loading}
                />
              ) : (
                <Button
                  onClick={handleEnableNotifications}
                  disabled={loading}
                  size="sm"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Enable'}
                </Button>
              )}
            </div>
          </div>

          {permission === 'granted' && (
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-gray-600">Test notification</span>
              <Button
                variant="outline"
                size="sm"
                onClick={sendTestNotification}
                disabled={!notificationsEnabled}
              >
                Send Test
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you'd like to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Learning Reminders */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-blue-600" />
              <div>
                <Label className="font-medium">Learning Reminders</Label>
                <p className="text-sm text-gray-600">Get notified about scheduled learning sessions</p>
              </div>
            </div>
            <Switch
              checked={localPreferences.learningReminders}
              onCheckedChange={(checked) => handlePreferenceChange('learningReminders', checked)}
              disabled={!notificationsEnabled}
            />
          </div>

          {/* Progress Updates */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Target className="w-5 h-5 text-green-600" />
              <div>
                <Label className="font-medium">Progress Updates</Label>
                <p className="text-sm text-gray-600">Receive updates on your learning progress</p>
              </div>
            </div>
            <Switch
              checked={localPreferences.progressUpdates}
              onCheckedChange={(checked) => handlePreferenceChange('progressUpdates', checked)}
              disabled={!notificationsEnabled}
            />
          </div>

          {/* Achievements */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Award className="w-5 h-5 text-purple-600" />
              <div>
                <Label className="font-medium">Achievements</Label>
                <p className="text-sm text-gray-600">Get notified when you unlock achievements</p>
              </div>
            </div>
            <Switch
              checked={localPreferences.achievements}
              onCheckedChange={(checked) => handlePreferenceChange('achievements', checked)}
              disabled={!notificationsEnabled}
            />
          </div>

          {/* Learning Streaks */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-orange-600" />
              <div>
                <Label className="font-medium">Learning Streaks</Label>
                <p className="text-sm text-gray-600">Celebrate consecutive learning days</p>
              </div>
            </div>
            <Switch
              checked={localPreferences.streaks}
              onCheckedChange={(checked) => handlePreferenceChange('streaks', checked)}
              disabled={!notificationsEnabled}
            />
          </div>

          {/* Collaborative Learning */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-indigo-600" />
              <div>
                <Label className="font-medium">Collaborative Learning</Label>
                <p className="text-sm text-gray-600">Notifications from study partners and groups</p>
              </div>
            </div>
            <Switch
              checked={localPreferences.collaborative}
              onCheckedChange={(checked) => handlePreferenceChange('collaborative', checked)}
              disabled={!notificationsEnabled}
            />
          </div>

          {/* Daily Digest */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bell className="w-5 h-5 text-gray-600" />
              <div>
                <Label className="font-medium">Daily Digest</Label>
                <p className="text-sm text-gray-600">Summary of daily learning activities</p>
              </div>
            </div>
            <Switch
              checked={localPreferences.dailyDigest}
              onCheckedChange={(checked) => handlePreferenceChange('dailyDigest', checked)}
              disabled={!notificationsEnabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Delivery Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            Delivery Settings
          </CardTitle>
          <CardDescription>
            Configure when and how often you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Frequency */}
          <div className="space-y-2">
            <Label className="font-medium">Notification Frequency</Label>
            <Select
              value={localPreferences.frequency}
              onValueChange={(value) => handlePreferenceChange('frequency', value)}
              disabled={!notificationsEnabled}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Quiet Hours */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="font-medium">Quiet Hours</Label>
                <p className="text-sm text-gray-600">Disable notifications during specific times</p>
              </div>
              <Switch
                checked={localPreferences.quietHours.enabled}
                onCheckedChange={(checked) => handlePreferenceChange('quietHours.enabled', checked)}
                disabled={!notificationsEnabled}
              />
            </div>

            {localPreferences.quietHours.enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Start Time</Label>
                  <Input
                    type="time"
                    value={localPreferences.quietHours.start}
                    onChange={(e) => handlePreferenceChange('quietHours.start', e.target.value)}
                    disabled={!notificationsEnabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">End Time</Label>
                  <Input
                    type="time"
                    value={localPreferences.quietHours.end}
                    onChange={(e) => handlePreferenceChange('quietHours.end', e.target.value)}
                    disabled={!notificationsEnabled}
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-sm text-gray-600">You have unsaved changes</span>
              </div>
              <Button onClick={handleSavePreferences} disabled={loading}>
                {loading ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : null}
                Save Preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
              Enable notifications to stay motivated with learning reminders
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
              Use quiet hours to avoid interruptions during sleep or focus time
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
              Adjust frequency based on your learning preferences and schedule
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
              Test notifications to ensure they're working properly
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}