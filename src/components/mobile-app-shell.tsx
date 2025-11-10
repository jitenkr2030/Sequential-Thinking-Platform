"use client"

import { useState, useEffect } from "react"
import { TouchNavigation } from "@/components/ui/touch-navigation"
import { TouchHeader } from "@/components/ui/touch-navigation"
import { OfflineManager } from "@/components/offline-manager"
import { NotificationSettings } from "@/components/notification-settings"
import { useOffline } from "@/hooks/use-offline"
import { useNotifications } from "@/hooks/use-notifications"
import { 
  Home, 
  Settings, 
  WifiOff, 
  Bell, 
  User, 
  BookOpen,
  Menu,
  X,
  ChevronLeft,
  Download,
  BarChart3
} from "lucide-react"

interface MobileAppShellProps {
  children: React.ReactNode
  currentRoute: string
  onRouteChange: (route: string) => void
}

interface AppRoute {
  id: string
  path: string
  title: string
  icon: React.ComponentType<{ className?: string }>
  showInNav?: boolean
}

const appRoutes: AppRoute[] = [
  { id: 'home', path: '/', title: 'Home', icon: Home, showInNav: true },
  { id: 'self-study', path: '/?mode=self-study', title: 'Self Study', icon: BookOpen, showInNav: true },
  { id: 'exam', path: '/?mode=exam-simulation', title: 'Exam', icon: BarChart3, showInNav: true },
  { id: 'analytics', path: '/?mode=analytics', title: 'Analytics', icon: BarChart3, showInNav: true },
  { id: 'offline', path: '/?mode=offline', title: 'Offline', icon: WifiOff, showInNav: true },
  { id: 'settings', path: '/settings', title: 'Settings', icon: Settings, showInNav: false },
  { id: 'notifications', path: '/notifications', title: 'Notifications', icon: Bell, showInNav: false },
  { id: 'profile', path: '/profile', title: 'Profile', icon: User, showInNav: false }
]

export function MobileAppShell({ children, currentRoute, onRouteChange }: MobileAppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentView, setCurrentView] = useState<'main' | 'settings' | 'notifications' | 'offline'>('main')
  
  const { isOnline, isOfflineMode, downloadedMaps } = useOffline()
  const { notificationsEnabled } = useNotifications()

  // Handle route changes
  useEffect(() => {
    // Determine current view based on route
    if (currentRoute.includes('settings')) {
      setCurrentView('settings')
    } else if (currentRoute.includes('notifications')) {
      setCurrentView('notifications')
    } else if (currentRoute.includes('offline')) {
      setCurrentView('offline')
    } else {
      setCurrentView('main')
    }
  }, [currentRoute])

  const handleRouteChange = (route: string) => {
    onRouteChange(route)
    setSidebarOpen(false)
  }

  const getCurrentTitle = () => {
    const route = appRoutes.find(r => r.path === currentRoute)
    return route?.title || 'Sequential Thinking'
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'settings':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-2xl mx-auto">
              <TouchHeader
                title="Settings"
                onBack={() => handleRouteChange('/')}
              />
              <div className="mt-6 space-y-6">
                {/* Account Settings */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-4">Account</h3>
                  <div className="space-y-3">
                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <User className="w-5 h-5 mr-3 text-gray-600" />
                        <span>Profile</span>
                      </div>
                    </button>
                    <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center">
                        <BookOpen className="w-5 h-5 mr-3 text-gray-600" />
                        <span>Learning Preferences</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* App Settings */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-4">App Settings</h3>
                  <div className="space-y-3">
                    <button 
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => handleRouteChange('/notifications')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Bell className="w-5 h-5 mr-3 text-gray-600" />
                          <span>Notifications</span>
                        </div>
                        <div className="flex items-center">
                          {notificationsEnabled && (
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          )}
                          <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
                        </div>
                      </div>
                    </button>
                    <button 
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      onClick={() => handleRouteChange('/?mode=offline')}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <WifiOff className="w-5 h-5 mr-3 text-gray-600" />
                          <span>Offline Mode</span>
                        </div>
                        <div className="flex items-center">
                          {downloadedMaps.length > 0 && (
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          )}
                          <ChevronLeft className="w-4 h-4 rotate-180 text-gray-400" />
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* About */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h3 className="font-medium mb-4">About</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p>Sequential Thinking Platform</p>
                    <p>Version 1.0.0</p>
                    <p>© 2024 Sequential Thinking Inc.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-2xl mx-auto">
              <TouchHeader
                title="Notifications"
                onBack={() => handleRouteChange('/settings')}
              />
              <div className="mt-6">
                <NotificationSettings />
              </div>
            </div>
          </div>
        )

      case 'offline':
        return (
          <div className="container mx-auto px-4 py-6">
            <div className="max-w-2xl mx-auto">
              <TouchHeader
                title="Offline Content"
                onBack={() => handleRouteChange('/settings')}
              />
              <div className="mt-6">
                <OfflineManager />
              </div>
            </div>
          </div>
        )

      default:
        return children
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Status Bar (iOS style) */}
      <div className="bg-white border-b border-gray-200 px-4 py-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">9:41</span>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-3 bg-black rounded-sm opacity-20" />
            <div className="w-1 h-3 bg-black rounded-sm opacity-20" />
            <div className="w-6 h-3 bg-black rounded-sm opacity-20" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <div className={`
          fixed left-0 top-0 bottom-0 w-64 bg-white z-50 transform transition-transform
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <nav className="p-4">
            <div className="space-y-1">
              {appRoutes.map((route) => (
                <button
                  key={route.id}
                  onClick={() => handleRouteChange(route.path)}
                  className={`
                    w-full flex items-center p-3 rounded-lg transition-colors
                    ${currentRoute === route.path 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'hover:bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  <route.icon className="w-5 h-5 mr-3" />
                  <span>{route.title}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Offline Status */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className={`w-2 h-2 rounded-full mr-2 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              {downloadedMaps.length > 0 && (
                <span className="text-gray-500">{downloadedMaps.length} saved</span>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="h-full overflow-y-auto">
          {/* App Header */}
          {currentView === 'main' && (
            <TouchHeader
              title={getCurrentTitle()}
              onBack={currentRoute !== '/' ? () => handleRouteChange('/') : undefined}
              actions={
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 rounded-lg hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
              }
            />
          )}

          {/* Content */}
          {renderCurrentView()}
        </div>
      </div>

      {/* Bottom Navigation (only for main view) */}
      {currentView === 'main' && (
        <TouchNavigation
          currentRoute={currentRoute}
          onNavigate={handleRouteChange}
        />
      )}

      {/* Install App Banner */}
      <InstallAppBanner />
    </div>
  )
}

function InstallAppBanner() {
  const [dismissed, setDismissed] = useState(false)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    const isInstalled = localStorage.getItem('appInstalled')
    const isDismissed = localStorage.getItem('installBannerDismissed')
    
    if (!isInstalled && !isDismissed && 'BeforeInstallPromptEvent' in window) {
      setShowBanner(true)
    }
  }, [])

  const handleInstall = async () => {
    // In a real app, this would trigger the install prompt
    localStorage.setItem('appInstalled', 'true')
    setShowBanner(false)
  }

  const handleDismiss = () => {
    localStorage.setItem('installBannerDismissed', 'true')
    setDismissed(true)
    setShowBanner(false)
  }

  if (!showBanner || dismissed) return null

  return (
    <div className="fixed bottom-16 left-0 right-0 bg-blue-600 text-white p-3 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <Download className="w-5 h-5 mr-2" />
          <span className="text-sm font-medium">Install our app for a better experience</span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleInstall}
            className="px-3 py-1 bg-white text-blue-600 rounded text-sm font-medium"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-blue-700 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}