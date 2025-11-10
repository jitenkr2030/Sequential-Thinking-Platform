"use client"

import { useState, useRef, useEffect } from "react"
import { cn } from "@/lib/utils"
import { touch } from "@/lib/responsive"
import { useTap } from "@/hooks/use-gestures"

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  required?: boolean
}

export function MobileInput({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  required = false,
  className = "",
  ...props
}: MobileInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  const inputClasses = cn(
    // Base styles
    'w-full transition-all duration-200',
    'bg-white border rounded-lg',
    'text-gray-900 placeholder-gray-500',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    
    // Touch-friendly sizing
    `h-[${touch.inputHeight}px]`,
    `px-${touch.inputPadding}`,
    
    // States
    error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : isFocused
      ? 'border-blue-500 focus:ring-blue-500 focus:border-blue-500'
      : 'border-gray-300 focus:border-gray-400',
    
    // Disabled state
    props.disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
    
    className
  )

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={inputRef}
          className={cn(
            inputClasses,
            leftIcon && 'pl-10',
            rightIcon && 'pr-10'
          )}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <p className={cn(
          'text-xs',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}

interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  required?: boolean
}

export function MobileSelect({
  label,
  error,
  helperText,
  options,
  required = false,
  className = "",
  ...props
}: MobileSelectProps) {
  const [isFocused, setIsFocused] = useState(false)

  const handleFocus = () => setIsFocused(true)
  const handleBlur = () => setIsFocused(false)

  const selectClasses = cn(
    // Base styles
    'w-full transition-all duration-200 appearance-none',
    'bg-white border rounded-lg',
    'text-gray-900',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    
    // Touch-friendly sizing
    `h-[${touch.inputHeight}px]`,
    `px-${touch.inputPadding}`,
    'pr-10', // Space for dropdown arrow
    
    // States
    error
      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
      : isFocused
      ? 'border-blue-500 focus:ring-blue-500 focus:border-blue-500'
      : 'border-gray-300 focus:border-gray-400',
    
    // Disabled state
    props.disabled && 'opacity-50 cursor-not-allowed bg-gray-50',
    
    className
  )

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-gray-700 flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          className={selectClasses}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        >
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        {/* Custom dropdown arrow */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      
      {(error || helperText) && (
        <p className={cn(
          'text-xs',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}

interface MobileCheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
}

export function MobileCheckbox({
  label,
  error,
  helperText,
  required = false,
  className = "",
  ...props
}: MobileCheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null)
  const tapProps = useTap(
    () => {
      if (checkboxRef.current && !props.disabled) {
        checkboxRef.current.click()
      }
    },
    undefined,
    { tapThreshold: 15 }
  )

  return (
    <div className="space-y-2">
      <div
        ref={tapProps.elementRef}
        className={cn(
          'flex items-start space-x-3 p-3 rounded-lg transition-colors cursor-pointer',
          'hover:bg-gray-50 active:bg-gray-100',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center h-5 mt-0.5">
          <input
            ref={checkboxRef}
            type="checkbox"
            className={cn(
              'w-5 h-5 rounded border-2',
              'text-blue-600 focus:ring-blue-500 focus:ring-offset-2',
              'border-gray-300 focus:border-blue-500',
              'transition-all duration-200',
              props.disabled && 'cursor-not-allowed bg-gray-50',
              className
            )}
            {...props}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          {label && (
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          {helperText && (
            <p className="text-xs text-gray-500 mt-1">
              {helperText}
            </p>
          )}
        </div>
      </div>
      
      {error && (
        <p className="text-xs text-red-600 ml-8">
          {error}
        </p>
      )}
    </div>
  )
}

interface MobileRadioGroupProps {
  label?: string
  options: Array<{ value: string; label: string; description?: string }>
  value?: string
  onChange?: (value: string) => void
  error?: string
  helperText?: string
  required?: boolean
  name?: string
  className?: string
}

export function MobileRadioGroup({
  label,
  options,
  value,
  onChange,
  error,
  helperText,
  required = false,
  name = "radio-group",
  className = ""
}: MobileRadioGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-700 flex items-center">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="space-y-2">
        {options.map((option) => {
          return (
            <div
              key={option.value}
              className={cn(
                'relative p-4 rounded-lg border-2 transition-all cursor-pointer',
                'hover:border-blue-300 active:bg-blue-50',
                value === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200',
                className
              )}
              onClick={() => onChange?.(option.value)}
            >
              <div className="flex items-start">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    type="radio"
                    name={name}
                    value={option.value}
                    checked={value === option.value}
                    onChange={() => onChange?.(option.value)}
                    className={cn(
                      'w-5 h-5 text-blue-600 focus:ring-blue-500 focus:ring-offset-2',
                      'border-gray-300 focus:border-blue-500',
                      'transition-all duration-200'
                    )}
                  />
                </div>
                
                <div className="ml-3 flex-1 min-w-0">
                  <label className="text-sm font-medium text-gray-700 cursor-pointer">
                    {option.label}
                  </label>
                  
                  {option.description && (
                    <p className="text-xs text-gray-500 mt-1">
                      {option.description}
                    </p>
                  )}
                </div>
                
                {value === option.value && (
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
      
      {(error || helperText) && (
        <p className={cn(
          'text-xs',
          error ? 'text-red-600' : 'text-gray-500'
        )}>
          {error || helperText}
        </p>
      )}
    </div>
  )
}

interface MobileButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export function MobileButton({
  children,
  variant = 'default',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = "",
  disabled,
  ...props
}: MobileButtonProps) {
  const tapProps = useTap(
    props.onClick,
    undefined,
    { tapThreshold: 10 }
  )

  const baseClasses = cn(
    // Base styles
    'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'select-none touch-none',
    
    // Touch-friendly sizing
    {
      'h-10 px-4 text-sm': size === 'sm',
      'h-12 px-6 text-base': size === 'md',
      'h-14 px-8 text-lg': size === 'lg',
      'h-16 px-10 text-xl': size === 'xl'
    },
    
    // Width
    fullWidth && 'w-full',
    
    // Active state
    'active:scale-95 active:shadow-inner',
    
    // Loading state
    loading && 'cursor-not-allowed'
  )

  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    destructive: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
    outline: 'border border-gray-300 bg-white hover:bg-gray-50 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500 shadow-sm',
    ghost: 'hover:bg-gray-100 focus:ring-gray-500',
    link: 'text-blue-600 hover:text-blue-800 focus:ring-blue-500 underline-offset-4 hover:underline'
  }

  const buttonClasses = cn(baseClasses, variantClasses[variant], className)

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) return
    props.onClick?.(e)
  }

  return (
    <button
      ref={tapProps.elementRef}
      className={buttonClasses}
      onClick={handleClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      <span className={loading ? 'invisible' : ''}>
        {children}
      </span>
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </button>
  )
}

interface MobileSwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
}

export function MobileSwitch({
  label,
  description,
  error,
  required = false,
  className = "",
  ...props
}: MobileSwitchProps) {
  const [isChecked, setIsChecked] = useState(props.checked || false)
  const switchRef = useRef<HTMLInputElement>(null)

  const tapProps = useTap(
    () => {
      if (switchRef.current && !props.disabled) {
        switchRef.current.click()
      }
    },
    undefined,
    { tapThreshold: 15 }
  )

  useEffect(() => {
    setIsChecked(props.checked || false)
  }, [props.checked])

  return (
    <div className="space-y-2">
      <div
        ref={tapProps.elementRef}
        className={cn(
          'flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer',
          'hover:bg-gray-50 active:bg-gray-100',
          props.disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex-1 min-w-0">
          {label && (
            <label className="text-sm font-medium text-gray-700 cursor-pointer flex items-center">
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}
          
          {description && (
            <p className="text-xs text-gray-500 mt-1">
              {description}
            </p>
          )}
        </div>
        
        <div className="relative">
          <input
            ref={switchRef}
            type="checkbox"
            className="sr-only"
            checked={isChecked}
            {...props}
          />
          
          <div className={cn(
            'w-12 h-6 rounded-full transition-colors duration-200',
            isChecked ? 'bg-blue-600' : 'bg-gray-200'
          )}>
            <div className={cn(
              'absolute top-0.5 left-0.5 bg-white rounded-full transition-transform duration-200',
              'w-5 h-5 shadow-sm',
              isChecked ? 'translate-x-6' : 'translate-x-0'
            )} />
          </div>
        </div>
      </div>
      
      {error && (
        <p className="text-xs text-red-600 ml-3">
          {error}
        </p>
      )}
    </div>
  )
}