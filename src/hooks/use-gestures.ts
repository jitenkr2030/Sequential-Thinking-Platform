"use client"

import { useState, useEffect, useRef, useCallback } from 'react'

export interface GestureEvent {
  type: 'swipe' | 'tap' | 'longpress' | 'pinch' | 'rotate'
  direction?: 'left' | 'right' | 'up' | 'down'
  distance?: number
  velocity?: number
  scale?: number
  rotation?: number
  touches: number
  timestamp: number
}

export interface GestureConfig {
  enableSwipe?: boolean
  enableTap?: boolean
  enableLongPress?: boolean
  enablePinch?: boolean
  enableRotate?: boolean
  swipeThreshold?: number
  longPressDelay?: number
  tapThreshold?: number
  preventDefault?: boolean
}

const defaultConfig: GestureConfig = {
  enableSwipe: true,
  enableTap: true,
  enableLongPress: true,
  enablePinch: false,
  enableRotate: false,
  swipeThreshold: 50,
  longPressDelay: 500,
  tapThreshold: 10,
  preventDefault: true
}

export function useGestures(
  onGesture: (gesture: GestureEvent) => void,
  config: GestureConfig = {}
) {
  const [isActive, setIsActive] = useState(false)
  const elementRef = useRef<HTMLElement>(null)
  const gestureState = useRef({
    startX: 0,
    startY: 0,
    startTime: 0,
    lastX: 0,
    lastY: 0,
    lastTime: 0,
    touches: 0,
    initialDistance: 0,
    initialAngle: 0,
    longPressTimer: null as any,
    isLongPress: false
  })

  const finalConfig = { ...defaultConfig, ...config }

  const getTouchPosition = useCallback((touch: Touch) => {
    return {
      x: touch.clientX,
      y: touch.clientY
    }
  }, [])

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX
    const dy = touch1.clientY - touch2.clientY
    return Math.sqrt(dx * dx + dy * dy)
  }, [])

  const getAngle = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch2.clientX - touch1.clientX
    const dy = touch2.clientY - touch1.clientY
    return Math.atan2(dy, dx) * 180 / Math.PI
  }, [])

  const handleTouchStart = useCallback((event: TouchEvent) => {
    if (!elementRef.current || !elementRef.current.contains(event.target as Node)) {
      return
    }

    if (finalConfig.preventDefault) {
      event.preventDefault()
    }

    const touch = event.touches[0]
    const position = getTouchPosition(touch)
    
    gestureState.current = {
      startX: position.x,
      startY: position.y,
      startTime: Date.now(),
      lastX: position.x,
      lastY: position.y,
      lastTime: Date.now(),
      touches: event.touches.length,
      initialDistance: 0,
      initialAngle: 0,
      longPressTimer: null,
      isLongPress: false
    }

    setIsActive(true)

    // Setup long press timer
    if (finalConfig.enableLongPress && event.touches.length === 1) {
      gestureState.current.longPressTimer = setTimeout(() => {
        gestureState.current.isLongPress = true
        onGesture({
          type: 'longpress',
          touches: 1,
          timestamp: Date.now()
        })
      }, finalConfig.longPressDelay)
    }

    // Setup pinch/rotate for multi-touch
    if (event.touches.length === 2) {
      gestureState.current.initialDistance = getDistance(event.touches[0], event.touches[1])
      gestureState.current.initialAngle = getAngle(event.touches[0], event.touches[1])
    }
  }, [finalConfig, getTouchPosition, getDistance, getAngle, onGesture])

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!isActive || !elementRef.current) {
      return
    }

    if (finalConfig.preventDefault) {
      event.preventDefault()
    }

    const touch = event.touches[0]
    const position = getTouchPosition(touch)
    const currentTime = Date.now()
    
    const deltaX = position.x - gestureState.current.startX
    const deltaY = position.y - gestureState.current.startY
    const deltaTime = currentTime - gestureState.current.startTime
    
    // Calculate velocity
    const velocityX = (position.x - gestureState.current.lastX) / (currentTime - gestureState.current.lastTime)
    const velocityY = (position.y - gestureState.current.lastY) / (currentTime - gestureState.current.lastTime)
    const velocity = Math.sqrt(velocityX * velocityX + velocityY * velocityY)

    // Cancel long press if moved too much
    if (gestureState.current.longPressTimer && 
        (Math.abs(deltaX) > finalConfig.tapThreshold || 
         Math.abs(deltaY) > finalConfig.tapThreshold)) {
      clearTimeout(gestureState.current.longPressTimer)
      gestureState.current.longPressTimer = null
    }

    // Handle pinch gesture
    if (finalConfig.enablePinch && event.touches.length === 2) {
      const currentDistance = getDistance(event.touches[0], event.touches[1])
      const scale = currentDistance / gestureState.current.initialDistance
      
      onGesture({
        type: 'pinch',
        scale,
        touches: 2,
        timestamp: currentTime
      })
    }

    // Handle rotate gesture
    if (finalConfig.enableRotate && event.touches.length === 2) {
      const currentAngle = getAngle(event.touches[0], event.touches[1])
      const rotation = currentAngle - gestureState.current.initialAngle
      
      onGesture({
        type: 'rotate',
        rotation,
        touches: 2,
        timestamp: currentTime
      })
    }

    gestureState.current.lastX = position.x
    gestureState.current.lastY = position.y
    gestureState.current.lastTime = currentTime
    gestureState.current.touches = event.touches.length
  }, [isActive, finalConfig, getTouchPosition, getDistance, getAngle, onGesture])

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!isActive) {
      return
    }

    if (finalConfig.preventDefault) {
      event.preventDefault()
    }

    const touch = event.changedTouches[0]
    const position = getTouchPosition(touch)
    const currentTime = Date.now()
    
    const deltaX = position.x - gestureState.current.startX
    const deltaY = position.y - gestureState.current.startY
    const deltaTime = currentTime - gestureState.current.startTime
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY)

    // Clear long press timer
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer)
      gestureState.current.longPressTimer = null
    }

    // Handle tap
    if (finalConfig.enableTap && 
        !gestureState.current.isLongPress &&
        distance <= finalConfig.tapThreshold &&
        deltaTime < finalConfig.longPressDelay) {
      onGesture({
        type: 'tap',
        touches: 1,
        timestamp: currentTime
      })
    }

    // Handle swipe
    if (finalConfig.enableSwipe && 
        !gestureState.current.isLongPress &&
        distance > finalConfig.swipeThreshold &&
        deltaTime < 1000) {
      
      let direction: 'left' | 'right' | 'up' | 'down'
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left'
      } else {
        direction = deltaY > 0 ? 'down' : 'up'
      }

      const velocity = distance / deltaTime

      onGesture({
        type: 'swipe',
        direction,
        distance,
        velocity,
        touches: 1,
        timestamp: currentTime
      })
    }

    setIsActive(false)
  }, [isActive, finalConfig, getTouchPosition, onGesture])

  const handleTouchCancel = useCallback((event: TouchEvent) => {
    if (gestureState.current.longPressTimer) {
      clearTimeout(gestureState.current.longPressTimer)
      gestureState.current.longPressTimer = null
    }
    setIsActive(false)
  }, [])

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    element.addEventListener('touchstart', handleTouchStart, { passive: !finalConfig.preventDefault })
    element.addEventListener('touchmove', handleTouchMove, { passive: !finalConfig.preventDefault })
    element.addEventListener('touchend', handleTouchEnd, { passive: !finalConfig.preventDefault })
    element.addEventListener('touchcancel', handleTouchCancel, { passive: !finalConfig.preventDefault })

    return () => {
      element.removeEventListener('touchstart', handleTouchStart)
      element.removeEventListener('touchmove', handleTouchMove)
      element.removeEventListener('touchend', handleTouchEnd)
      element.removeEventListener('touchcancel', handleTouchCancel)
      
      if (gestureState.current.longPressTimer) {
        clearTimeout(gestureState.current.longPressTimer)
      }
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, handleTouchCancel, finalConfig.preventDefault])

  return {
    elementRef,
    isActive
  }
}

// Hook for swipe navigation specifically
export function useSwipeNavigation(
  onSwipeLeft?: () => void,
  onSwipeRight?: () => void,
  onSwipeUp?: () => void,
  onSwipeDown?: () => void,
  config?: Partial<GestureConfig>
) {
  const handleGesture = useCallback((gesture: GestureEvent) => {
    if (gesture.type === 'swipe' && gesture.direction) {
      switch (gesture.direction) {
        case 'left':
          onSwipeLeft?.()
          break
        case 'right':
          onSwipeRight?.()
          break
        case 'up':
          onSwipeUp?.()
          break
        case 'down':
          onSwipeDown?.()
          break
      }
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown])

  return useGestures(handleGesture, {
    enableSwipe: true,
    enableTap: false,
    enableLongPress: false,
    ...config
  })
}

// Hook for tap detection
export function useTap(
  onTap?: () => void,
  onLongPress?: () => void,
  config?: Partial<GestureConfig>
) {
  const handleGesture = useCallback((gesture: GestureEvent) => {
    if (gesture.type === 'tap') {
      onTap?.()
    } else if (gesture.type === 'longpress') {
      onLongPress?.()
    }
  }, [onTap, onLongPress])

  return useGestures(handleGesture, {
    enableSwipe: false,
    enableTap: true,
    enableLongPress: true,
    ...config
  })
}