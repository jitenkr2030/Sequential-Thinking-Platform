"use client"

import { useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Brain, WifiOff, Download, RefreshCw, BookOpen } from "lucide-react"

export default function OfflinePage() {
  useEffect(() => {
    // Check if service worker is registered
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        console.log('Service Worker is ready:', registration)
      })
    }
  }, [])

  const handleRefresh = () => {
    window.location.reload()
  }

  const handleGoOffline = () => {
    // Navigate to offline mode
    window.location.href = '/?mode=offline'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Offline Status Card */}
        <Card className="text-center">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-amber-100 rounded-full">
                <WifiOff className="h-8 w-8 text-amber-600" />
              </div>
            </div>
            <CardTitle className="text-xl text-gray-900">You're Offline</CardTitle>
            <CardDescription className="text-gray-600">
              No internet connection detected. Some features may be limited.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
              <Button onClick={handleRefresh} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={handleGoOffline} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Use Offline Mode
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Available Offline Features */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
              Available Offline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Downloaded Reasoning Maps</span>
                <Badge variant="secondary">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progress Tracking</span>
                <Badge variant="secondary">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Basic Learning Modes</span>
                <Badge variant="secondary">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI Guidance</span>
                <Badge variant="outline">Limited</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Real-time Analytics</span>
                <Badge variant="outline">Unavailable</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Offline Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                Download content while online for full offline access
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                Your progress will sync automatically when you're back online
              </li>
              <li className="flex items-start">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
                Use gesture controls for better mobile experience
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Branding */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Brain className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Sequential Thinking Platform</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Learning continues, even offline
          </p>
        </div>
      </div>
    </div>
  )
}