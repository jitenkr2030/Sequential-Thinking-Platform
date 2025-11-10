"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Download, 
  DownloadOff, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Trash2, 
  Storage,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react"
import { useOffline } from "@/hooks/use-offline"

interface OfflineManagerProps {
  reasoningMaps?: any[]
  onMapSelect?: (map: any) => void
}

export function OfflineManager({ reasoningMaps = [], onMapSelect }: OfflineManagerProps) {
  const {
    isOnline,
    isOfflineMode,
    downloadedMaps,
    storageInfo,
    syncStatus,
    loading,
    downloadReasoningMap,
    removeDownloadedMap,
    clearOfflineData,
    syncOfflineData,
    toggleOfflineMode
  } = useOffline()

  const [downloading, setDownloading] = useState<string[]>([])

  const handleDownload = async (map: any) => {
    setDownloading(prev => [...prev, map.id])
    const success = await downloadReasoningMap(map)
    setDownloading(prev => prev.filter(id => id !== map.id))
    
    if (success) {
      // Show success feedback
    }
  }

  const handleRemove = async (mapId: string) => {
    await removeDownloadedMap(mapId)
  }

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all offline data? This cannot be undone.')) {
      await clearOfflineData()
    }
  }

  const isMapDownloaded = (mapId: string) => {
    return downloadedMaps.some(m => m.id === mapId)
  }

  const getMapSize = (map: any) => {
    // Estimate size based on content
    const jsonSize = JSON.stringify(map).length
    return Math.round(jsonSize / 1024) // KB
  }

  const getTotalStorage = () => {
    const total = Object.values(storageInfo).reduce((sum: number, count: any) => sum + count, 0)
    return Math.round(total * 50) // Rough estimate in KB
  }

  return (
    <div className="space-y-6">
      {/* Offline Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              {isOnline ? <Wifi className="w-5 h-5 mr-2 text-green-600" /> : <WifiOff className="w-5 h-5 mr-2 text-red-600" />}
              Offline Status
            </span>
            <Badge variant={isOnline ? "default" : "secondary"}>
              {isOnline ? "Online" : "Offline"}
            </Badge>
          </CardTitle>
          <CardDescription>
            Manage your offline learning content and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Offline Mode</span>
              <Badge variant={isOfflineMode ? "default" : "outline"}>
                {isOfflineMode ? "Active" : "Inactive"}
              </Badge>
            </div>
            <Button
              variant={isOfflineMode ? "default" : "outline"}
              size="sm"
              onClick={toggleOfflineMode}
            >
              {isOfflineMode ? "Disable" : "Enable"}
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Sync Status</span>
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              ) : syncStatus === 'synced' ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <Clock className="w-4 h-4 text-amber-600" />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={syncOfflineData}
              disabled={!isOnline || syncStatus === 'syncing'}
            >
              Sync Now
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Storage Usage</span>
              <span className="text-xs text-gray-500">{getTotalStorage()} KB</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Reasoning Maps</span>
                <span>{storageInfo.reasoningMaps || 0} items</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Learning Progress</span>
                <span>{storageInfo.learningProgress || 0} items</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span>Cached Content</span>
                <span>{storageInfo.cachedContent || 0} items</span>
              </div>
            </div>
          </div>

          {downloadedMaps.length > 0 && (
            <div className="border-t pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Offline Data
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available for Download */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="w-5 h-5 mr-2" />
            Available for Download
          </CardTitle>
          <CardDescription>
            Download reasoning maps for offline use
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : reasoningMaps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p>No reasoning maps available for download</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reasoningMaps.map((map) => {
                const isDownloaded = isMapDownloaded(map.id)
                const isDownloading = downloading.includes(map.id)
                const size = getMapSize(map)

                return (
                  <div key={map.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{map.title}</h4>
                      <p className="text-xs text-gray-500">{map.domain}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {size} KB
                        </Badge>
                        {isDownloaded && (
                          <Badge variant="secondary" className="text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Downloaded
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {isDownloading ? (
                        <div className="w-8 h-8">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        </div>
                      ) : isDownloaded ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRemove(map.id)}
                        >
                          <DownloadOff className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownload(map)}
                          disabled={!isOnline}
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      )}
                      {onMapSelect && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMapSelect(map)}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Downloaded Content */}
      {downloadedMaps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Storage className="w-5 h-5 mr-2" />
              Downloaded Content
            </CardTitle>
            <CardDescription>
              Access your downloaded reasoning maps offline
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {downloadedMaps.map((map) => {
                const size = getMapSize(map)
                const lastAccessed = new Date(map.lastAccessed).toLocaleDateString()

                return (
                  <div key={map.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{map.title}</h4>
                      <p className="text-xs text-gray-500">{map.domain}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {size} KB
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          Last accessed: {lastAccessed}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemove(map.id)}
                      >
                        <DownloadOff className="w-4 h-4" />
                      </Button>
                      {onMapSelect && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onMapSelect(map)}
                        >
                          View
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Offline Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Offline Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
              Download content while connected to the internet for the best experience
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
              Your progress automatically syncs when you come back online
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
              Enable offline mode to prioritize downloaded content
            </li>
            <li className="flex items-start">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2 mt-2 flex-shrink-0" />
              Manage storage by removing old or unused content
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}