"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useState } from "react"

interface FixedSelectProps {
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  className?: string
}

export function FixedSelect({ value, onValueChange, placeholder, children, className }: FixedSelectProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Ensure dropdown appears above everything when open
  useEffect(() => {
    if (isOpen) {
      // Force z-index for dropdown content
      const dropdownContent = document.querySelector('[data-radix-select-content][data-state="open"]')
      if (dropdownContent) {
        const element = dropdownContent as HTMLElement
        element.style.zIndex = '199999'
        element.style.position = 'fixed'
        element.style.visibility = 'visible'
        element.style.opacity = '1'
        element.style.pointerEvents = 'auto'
        element.style.transform = 'none'
      }
    }
  }, [isOpen])

  return (
    <Select 
      value={value} 
      onValueChange={onValueChange}
      onOpenChange={setIsOpen}
      open={isOpen}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {children}
      </SelectContent>
    </Select>
  )
}

interface FixedSelectItemProps {
  value: string
  children: React.ReactNode
  disabled?: boolean
}

export function FixedSelectItem({ value, children, disabled }: FixedSelectItemProps) {
  return (
    <SelectItem value={value} disabled={disabled}>
      {children}
    </SelectItem>
  )
}