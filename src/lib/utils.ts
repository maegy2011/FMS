import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency in Egyptian Pounds with proper formatting
export function formatCurrency(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '٠.٠٠ ج.م'
  }

  // Round to 2 decimal places for piastres
  const roundedAmount = Math.round(amount * 100) / 100
  
  // Split into pounds and piastres
  const pounds = Math.floor(roundedAmount)
  const piastres = Math.round((roundedAmount - pounds) * 100)
  
  // Format pounds with Arabic thousands separator
  const formattedPounds = pounds.toLocaleString('ar-EG', {
    useGrouping: true,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
  
  // Convert to Arabic numerals
  const arabicPounds = convertToArabicNumerals(formattedPounds)
  const arabicPiastres = convertToArabicNumerals(piastres.toString().padStart(2, '0'))
  
  return `${arabicPounds}.${arabicPiastres} ج.م`
}

// Convert Western numerals to Arabic numerals
export function convertToArabicNumerals(str: string): string {
  const westernToArabic = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩'
  }
  
  return str.replace(/[0-9]/g, (digit) => westernToArabic[digit as keyof typeof westernToArabic])
}

// Calculate late payments based on last 3 paid revenues for each entity
export function calculateLatePayments(entities: any[], revenues: any[]): number {
  let totalLateAmount = 0
  
  entities.forEach(entity => {
    // Get paid revenues for this entity, sorted by payment date (most recent first)
    const entityPaidRevenues = revenues
      .filter(rev => rev.entityId === entity.id && rev.paymentDate)
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 3) // Take last 3 paid revenues
    
    // Calculate average of last 3 paid revenues
    if (entityPaidRevenues.length > 0) {
      const averageAmount = entityPaidRevenues.reduce((sum, rev) => sum + rev.value, 0) / entityPaidRevenues.length
      
      // Get unpaid revenues (late payments)
      const unpaidRevenues = revenues.filter(rev => 
        rev.entityId === entity.id && 
        !rev.paymentDate && 
        new Date(rev.dueDate) < new Date()
      )
      
      // Calculate late amount based on average
      totalLateAmount += unpaidRevenues.length * averageAmount
    }
  })
  
  return totalLateAmount
}

// Search function with minimum 3 characters
export function searchWithMinLength(searchTerm: string, data: any[], searchFields: string[]): any[] {
  if (searchTerm.length < 3) {
    return data
  }
  
  const lowerSearchTerm = searchTerm.toLowerCase()
  
  return data.filter(item => {
    return searchFields.some(field => {
      const value = item[field]
      if (value === null || value === undefined) return false
      
      const stringValue = String(value).toLowerCase()
      return stringValue.includes(lowerSearchTerm)
    })
  })
}