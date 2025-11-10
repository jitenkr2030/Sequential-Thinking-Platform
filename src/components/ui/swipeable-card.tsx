"use client"

import { useState, ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useSwipeNavigation, useTap } from "@/hooks/use-gestures"
import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react"

interface SwipeableCardProps {
  title: string
  description?: string
  children: ReactNode
  badge?: string
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onTap?: () => void
  onLongPress?: () => void
  className?: string
  disabled?: boolean
  showHints?: boolean
}

export function SwipeableCard({
  title,
  description,
  children,
  badge,
  badgeVariant = "default",
  onSwipeLeft,
  onSwipeRight,
  onTap,
  onLongPress,
  className = "",
  disabled = false,
  showHints = true
}: SwipeableCardProps) {
  const swipeProps = useSwipeNavigation(onSwipeLeft, onSwipeRight)
  const tapProps = useTap(onTap, onLongPress)

  const handleRef = (element: HTMLElement | null) => {
    swipeProps.elementRef.current = element
    tapProps.elementRef.current = element
  }

  return (
    <div className="relative">
      {/* Swipe hints */}
      {showHints && !disabled && (
        <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-10">
          {onSwipeRight && (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <ChevronLeft className="w-4 h-4 text-blue-600" />
            </div>
          )}
        </div>
      )}
      
      {showHints && !disabled && (
        <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10">
          {onSwipeLeft && (
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <ChevronRight className="w-4 h-4 text-blue-600" />
            </div>
          )}
        </div>
      )}

      {/* Main card */}
      <Card
        ref={handleRef}
        className={`
          transition-all duration-200 cursor-pointer select-none
          hover:shadow-lg active:scale-[0.98]
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          ${swipeProps.isActive ? 'shadow-xl scale-[1.02]' : ''}
          ${className}
        `}
        style={{
          touchAction: disabled ? 'auto' : 'pan-y'
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg leading-tight truncate">
                {title}
              </CardTitle>
              {description && (
                <CardDescription className="text-sm mt-1 line-clamp-2">
                  {description}
                </CardDescription>
              )}
            </div>
            <div className="flex items-center space-x-2 ml-2 flex-shrink-0">
              {badge && (
                <Badge variant={badgeVariant} className="text-xs">
                  {badge}
                </Badge>
              )}
              <MoreVertical className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {children}
        </CardContent>
      </Card>

      {/* Swipe indicators */}
      {swipeProps.isActive && !disabled && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-transparent opacity-50 rounded-lg" />
          <div className="absolute inset-0 bg-gradient-to-l from-blue-500/10 to-transparent opacity-50 rounded-lg" />
        </div>
      )}
    </div>
  )
}

interface SwipeableDeckProps {
  items: Array<{
    id: string
    title: string
    description?: string
    content: ReactNode
    badge?: string
  }>
  onSwipeLeft?: (item: any) => void
  onSwipeRight?: (item: any) => void
  onTap?: (item: any) => void
  className?: string
}

export function SwipeableDeck({
  items,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  className = ""
}: SwipeableDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleSwipeLeft = () => {
    if (currentIndex < items.length - 1) {
      const item = items[currentIndex]
      onSwipeLeft?.(item)
      setCurrentIndex(prev => prev + 1)
    }
  }

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      const item = items[currentIndex]
      onSwipeRight?.(item)
      setCurrentIndex(prev => prev - 1)
    }
  }

  const handleTap = () => {
    const item = items[currentIndex]
    onTap?.(item)
  }

  if (items.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <p className="text-gray-500">No items to display</p>
        </CardContent>
      </Card>
    )
  }

  const currentItem = items[currentIndex]

  return (
    <div className={className}>
      <SwipeableCard
        title={currentItem.title}
        description={currentItem.description}
        badge={currentItem.badge}
        onSwipeLeft={currentIndex < items.length - 1 ? handleSwipeLeft : undefined}
        onSwipeRight={currentIndex > 0 ? handleSwipeRight : undefined}
        onTap={handleTap}
        showHints={false}
      >
        {currentItem.content}
      </SwipeableCard>

      {/* Deck indicators */}
      <div className="flex justify-center space-x-2 mt-4">
        {items.map((_, index) => (
          <div
            key={index}
            className={`
              w-2 h-2 rounded-full transition-colors
              ${index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'}
            `}
          />
        ))}
      </div>

      {/* Navigation info */}
      <div className="text-center mt-2 text-sm text-gray-500">
        {currentIndex + 1} of {items.length}
      </div>
    </div>
  )
}