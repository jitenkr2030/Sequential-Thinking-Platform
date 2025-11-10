"use client"

import { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { containers, Breakpoint } from "@/lib/responsive"

interface ResponsiveContainerProps {
  children: ReactNode
  size?: Breakpoint | 'full' | 'min' | 'max' | '3xl' | '4xl'
  className?: string
  center?: boolean
  fluid?: boolean
}

export function ResponsiveContainer({
  children,
  size = 'lg',
  className = "",
  center = true,
  fluid = false
}: ResponsiveContainerProps) {
  const containerClasses = cn(
    'w-full',
    {
      'mx-auto': center && !fluid,
      'px-4 sm:px-6 lg:px-8': !fluid,
      'max-w-none': fluid
    },
    fluid ? '' : `max-w-${containers[size as keyof typeof containers]}`,
    className
  )

  return (
    <div className={containerClasses}>
      {children}
    </div>
  )
}

interface ResponsiveGridProps {
  children: ReactNode
  cols?: {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  gap?: number | {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  className?: string
}

export function ResponsiveGrid({
  children,
  cols = { base: 1, md: 2, lg: 3 },
  gap = 4,
  className = ""
}: ResponsiveGridProps) {
  const getColsClass = (breakpoint: string, value: number) => {
    return `${breakpoint}:grid-cols-${value}`
  }

  const getGapClass = (breakpoint: string, value: number) => {
    return `${breakpoint}:gap-${value}`
  }

  const gridClasses = cn(
    'grid',
    typeof cols === 'object' && [
      cols.base !== undefined && `grid-cols-${cols.base}`,
      cols.sm !== undefined && getColsClass('sm', cols.sm),
      cols.md !== undefined && getColsClass('md', cols.md),
      cols.lg !== undefined && getColsClass('lg', cols.lg),
      cols.xl !== undefined && getColsClass('xl', cols.xl),
      cols['2xl'] !== undefined && getColsClass('2xl', cols['2xl'])
    ],
    typeof gap === 'object' && [
      gap.base !== undefined && `gap-${gap.base}`,
      gap.sm !== undefined && getGapClass('sm', gap.sm),
      gap.md !== undefined && getGapClass('md', gap.md),
      gap.lg !== undefined && getGapClass('lg', gap.lg),
      gap.xl !== undefined && getGapClass('xl', gap.xl),
      gap['2xl'] !== undefined && getGapClass('2xl', gap['2xl'])
    ],
    typeof cols === 'number' && `grid-cols-${cols}`,
    typeof gap === 'number' && `gap-${gap}`,
    className
  )

  return (
    <div className={gridClasses}>
      {children}
    </div>
  )
}

interface ResponsiveFlexProps {
  children: ReactNode
  direction?: 'row' | 'col' | 'row-reverse' | 'col-reverse'
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  align?: 'start' | 'end' | 'center' | 'baseline' | 'stretch'
  gap?: number | {
    base?: number
    sm?: number
    md?: number
    lg?: number
    xl?: number
    '2xl'?: number
  }
  responsive?: {
    sm?: Partial<ResponsiveFlexProps>
    md?: Partial<ResponsiveFlexProps>
    lg?: Partial<ResponsiveFlexProps>
    xl?: Partial<ResponsiveFlexProps>
    '2xl'?: Partial<ResponsiveFlexProps>
  }
  className?: string
}

export function ResponsiveFlex({
  children,
  direction = 'row',
  wrap = 'nowrap',
  justify = 'start',
  align = 'stretch',
  gap = 0,
  responsive = {},
  className = ""
}: ResponsiveFlexProps) {
  const flexClasses = cn(
    'flex',
    `flex-${direction}`,
    `flex-${wrap}`,
    `justify-${justify}`,
    `items-${align}`,
    typeof gap === 'number' && `gap-${gap}`,
    className
  )

  const responsiveClasses = Object.entries(responsive).map(([breakpoint, props]) => {
    const classes = []
    if (props.direction) classes.push(`${breakpoint}:flex-${props.direction}`)
    if (props.wrap) classes.push(`${breakpoint}:flex-${props.wrap}`)
    if (props.justify) classes.push(`${breakpoint}:justify-${props.justify}`)
    if (props.align) classes.push(`${breakpoint}:items-${props.align}`)
    if (props.gap && typeof props.gap === 'number') classes.push(`${breakpoint}:gap-${props.gap}`)
    return classes.join(' ')
  }).join(' ')

  return (
    <div className={cn(flexClasses, responsiveClasses)}>
      {children}
    </div>
  )
}

interface ResponsiveTextProps {
  children: ReactNode
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'label' | 'small'
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl'
  weight?: 'thin' | 'extralight' | 'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'
  color?: string
  align?: 'left' | 'center' | 'right' | 'justify'
  responsive?: {
    sm?: Partial<ResponsiveTextProps>
    md?: Partial<ResponsiveTextProps>
    lg?: Partial<ResponsiveTextProps>
    xl?: Partial<ResponsiveTextProps>
    '2xl'?: Partial<ResponsiveTextProps>
  }
  className?: string
  as?: React.ElementType
}

export function ResponsiveText({
  children,
  variant = 'p',
  size = 'base',
  weight = 'normal',
  color = 'text-gray-900',
  align = 'left',
  responsive = {},
  className = "",
  as: Component = variant
}: ResponsiveTextProps) {
  const textClasses = cn(
    'leading-normal',
    `text-${size}`,
    `font-${weight}`,
    color,
    `text-${align}`,
    {
      'font-serif': variant === 'h1' || variant === 'h2' || variant === 'h3',
      'tracking-tight': variant === 'h1' || variant === 'h2'
    },
    className
  )

  const responsiveClasses = Object.entries(responsive).map(([breakpoint, props]) => {
    const classes = []
    if (props.size) classes.push(`${breakpoint}:text-${props.size}`)
    if (props.weight) classes.push(`${breakpoint}:font-${props.weight}`)
    if (props.color) classes.push(`${breakpoint}:${props.color}`)
    if (props.align) classes.push(`${breakpoint}:text-${props.align}`)
    return classes.join(' ')
  }).join(' ')

  return (
    <Component className={cn(textClasses, responsiveClasses)}>
      {children}
    </Component>
  )
}

interface ResponsiveSpacingProps {
  children: ReactNode
  spacing?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl'
  direction?: 'x' | 'y' | 'block' | 'inline'
  responsive?: {
    sm?: Partial<ResponsiveSpacingProps>
    md?: Partial<ResponsiveSpacingProps>
    lg?: Partial<ResponsiveSpacingProps>
    xl?: Partial<ResponsiveSpacingProps>
    '2xl'?: Partial<ResponsiveSpacingProps>
  }
  className?: string
}

export function ResponsiveSpacing({
  children,
  spacing = 'md',
  direction = 'y',
  responsive = {},
  className = ""
}: ResponsiveSpacingProps) {
  const getSpacingClass = (space: string, dir: string) => {
    const spacingMap = {
      none: 0,
      xs: 2,
      sm: 3,
      md: 4,
      lg: 6,
      xl: 8,
      '2xl': 10,
      '3xl': 12,
      '4xl': 16,
      '5xl': 20,
      '6xl': 24
    }
    
    const value = spacingMap[space as keyof typeof spacingMap] || 4
    
    switch (dir) {
      case 'x':
        return `px-${value}`
      case 'y':
        return `py-${value}`
      case 'block':
        return `p-${value}`
      case 'inline':
        return `px-${value}`
      default:
        return `p-${value}`
    }
  }

  const spacingClasses = getSpacingClass(spacing, direction)

  const responsiveClasses = Object.entries(responsive).map(([breakpoint, props]) => {
    if (props.spacing && props.direction) {
      return `${breakpoint}:${getSpacingClass(props.spacing, props.direction)}`
    }
    return ''
  }).join(' ')

  return (
    <div className={cn(spacingClasses, responsiveClasses, className)}>
      {children}
    </div>
  )
}

interface ResponsiveHiddenProps {
  children: ReactNode
  hide?: {
    xs?: boolean
    sm?: boolean
    md?: boolean
    lg?: boolean
    xl?: boolean
    '2xl'?: boolean
  }
  show?: {
    xs?: boolean
    sm?: boolean
    md?: boolean
    lg?: boolean
    xl?: boolean
    '2xl'?: boolean
  }
  className?: string
}

export function ResponsiveHidden({
  children,
  hide = {},
  show = {},
  className = ""
}: ResponsiveHiddenProps) {
  const hiddenClasses = Object.entries(hide)
    .filter(([_, value]) => value)
    .map(([breakpoint]) => `${breakpoint}:hidden`)
    .join(' ')

  const shownClasses = Object.entries(show)
    .filter(([_, value]) => value)
    .map(([breakpoint]) => `${breakpoint}:block`)
    .join(' ')

  const baseClasses = shownClasses ? 'hidden' : ''

  return (
    <div className={cn(baseClasses, hiddenClasses, shownClasses, className)}>
      {children}
    </div>
  )
}