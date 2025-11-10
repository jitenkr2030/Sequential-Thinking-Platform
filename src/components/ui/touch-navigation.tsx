"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { useSwipeNavigation, useTap } from "@/hooks/use-gestures"
import { ChevronLeft, ChevronRight, Home, BookOpen, GraduationCap, Users, BarChart3, WifiOff } from "lucide-react"

interface TouchNavigationProps {
  currentRoute: string
  onNavigate: (route: string) => void
  className?: string
}

interface NavItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  route: string
}

const navItems: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home, route: '/' },
  { id: 'self-study', label: 'Study', icon: BookOpen, route: '/?mode=self-study' },
  { id: 'exam', label: 'Exam', icon: GraduationCap, route: '/?mode=exam-simulation' },
  { id: 'teaching', label: 'Teach', icon: Users, route: '/?mode=teaching' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, route: '/?mode=analytics' },
  { id: 'offline', label: 'Offline', icon: WifiOff, route: '/?mode=offline' }
]

export function TouchNavigation({ currentRoute, onNavigate, className }: TouchNavigationProps) {
  const currentIndex = navItems.findIndex(item => item.route === currentRoute)
  
  const handleSwipeLeft = () => {
    if (currentIndex < navItems.length - 1) {
      onNavigate(navItems[currentIndex + 1].route)
    }
  }

  const handleSwipeRight = () => {
    if (currentIndex > 0) {
      onNavigate(navItems[currentIndex - 1].route)
    }
  }

  const swipeProps = useSwipeNavigation(
    handleSwipeRight,
    handleSwipeLeft,
    undefined,
    undefined,
    { swipeThreshold: 30 }
  )

  return (
    <nav 
      ref={swipeProps.elementRef}
      className={cn(
        "fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50",
        "touch-none select-none",
        className
      )}
      style={{ touchAction: 'pan-y' }}
    >
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const isActive = item.route === currentRoute
          const Icon = item.icon
          
          return (
            <TouchNavItem
              key={item.id}
              item={item}
              isActive={isActive}
              onTap={() => onNavigate(item.route)}
            />
          )
        })}
      </div>
      
      {/* Swipe hint overlay */}
      {swipeProps.isActive && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-blue-500/10 to-transparent" />
          <div className="absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-blue-500/10 to-transparent" />
        </div>
      )}
    </nav>
  )
}

interface TouchNavItemProps {
  item: NavItem
  isActive: boolean
  onTap: () => void
}

function TouchNavItem({ item, isActive, onTap }: TouchNavItemProps) {
  const tapProps = useTap(onTap, undefined, { tapThreshold: 15 })
  const Icon = item.icon

  return (
    <button
      ref={tapProps.elementRef}
      className={cn(
        "flex flex-col items-center justify-center w-16 h-full py-1 px-2",
        "transition-all duration-200 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        isActive
          ? "text-blue-600"
          : "text-gray-500 hover:text-gray-700"
      )}
      aria-label={item.label}
    >
      <Icon 
        className={cn(
          "w-6 h-6 mb-1 transition-transform",
          tapProps.isActive && "scale-110"
        )} 
      />
      <span className={cn(
        "text-xs font-medium transition-all",
        tapProps.isActive && "scale-105"
      )}>
        {item.label}
      </span>
      
      {/* Active indicator */}
      {isActive && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full" />
      )}
    </button>
  )
}

interface TouchHeaderProps {
  title: string
  subtitle?: string
  onBack?: () => void
  actions?: ReactNode
  className?: string
}

export function TouchHeader({ title, subtitle, onBack, actions, className }: TouchHeaderProps) {
  const swipeProps = useSwipeNavigation(
    onBack,
    undefined,
    undefined,
    undefined,
    { swipeThreshold: 50 }
  )

  return (
    <header 
      ref={swipeProps.elementRef}
      className={cn(
        "sticky top-0 z-40 bg-white border-b border-gray-200",
        "touch-none select-none",
        className
      )}
      style={{ touchAction: 'pan-y' }}
    >
      <div className="flex items-center justify-between h-14 px-4">
        <div className="flex items-center flex-1 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="mr-3 p-2 -ml-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors"
              aria-label="Back"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-500 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {actions && (
          <div className="flex items-center space-x-2 ml-4">
            {actions}
          </div>
        )}
      </div>
      
      {/* Swipe hint for back */}
      {onBack && swipeProps.isActive && (
        <div className="absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-blue-500/10 to-transparent pointer-events-none" />
      )}
    </header>
  )
}

interface TouchButtonProps {
  children: ReactNode
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  onTap?: () => void
  onLongPress?: () => void
  className?: string
}

export function TouchButton({ 
  children, 
  variant = 'default', 
  size = 'default',
  disabled = false,
  onTap,
  onLongPress,
  className = ""
}: TouchButtonProps) {
  const tapProps = useTap(onTap, onLongPress, { tapThreshold: 10 })

  const baseStyles = cn(
    "inline-flex items-center justify-center rounded-md font-medium transition-all",
    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
    "active:scale-95 active:shadow-inner",
    "select-none touch-none"
  )

  const variantStyles = {
    default: "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-sm",
    destructive: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 shadow-sm",
    outline: "border border-gray-300 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-sm",
    secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 shadow-sm",
    ghost: "hover:bg-gray-100 active:bg-gray-200",
    link: "text-blue-600 hover:text-blue-800 active:text-blue-900 underline-offset-4 hover:underline"
  }

  const sizeStyles = {
    default: "h-10 px-4 py-2 text-sm",
    sm: "h-9 px-3 text-xs",
    lg: "h-11 px-6 text-base",
    icon: "h-10 w-10"
  }

  return (
    <button
      ref={tapProps.elementRef}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        tapProps.isActive && "ring-2 ring-blue-400 ring-offset-2",
        className
      )}
      disabled={disabled}
    >
      {children}
    </button>
  )
}