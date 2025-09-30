import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'File must be a CSV file' },
        { status: 400 }
      )
    }

    // Read file content
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())

    if (lines.length < 2) {
      return NextResponse.json(
        { error: 'CSV file is empty or invalid' },
        { status: 400 }
      )
    }

    // Parse CSV
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
    const requiredHeaders = ['name', 'type', 'governorate']
    
    // Check required headers
    for (const requiredHeader of requiredHeaders) {
      if (!headers.includes(requiredHeader)) {
        return NextResponse.json(
          { error: `Missing required header: ${requiredHeader}` },
          { status: 400 }
        )
      }
    }

    let importedCount = 0
    const errors = []

    // Process each row
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i])
        
        if (values.length !== headers.length) {
          errors.push(`Row ${i + 1}: Invalid number of columns`)
          continue
        }

        // Create object from row
        const row: any = {}
        headers.forEach((header, index) => {
          row[header] = values[index] ? values[index].replace(/"/g, '') : ''
        })

        // Validate required fields
        if (!row.name || !row.type || !row.governorate) {
          errors.push(`Row ${i + 1}: Missing required fields`)
          continue
        }

        // Validate type
        if (!['main', 'branch', 'workers'].includes(row.type)) {
          errors.push(`Row ${i + 1}: Invalid type "${row.type}". Must be main, branch, or workers`)
          continue
        }

        // Check if entity already exists (by name and type)
        const existingEntity = await db.entity.findFirst({
          where: {
            name: row.name,
            type: row.type
          }
        })

        if (existingEntity) {
          errors.push(`Row ${i + 1}: Entity "${row.name}" of type "${row.type}" already exists`)
          continue
        }

        // Create new entity
        await db.entity.create({
          data: {
            name: row.name,
            type: row.type,
            governorate: row.governorate,
            description: row.description || null,
            address: row.address || null,
            phone: row.phone || null,
            email: row.email || null,
            website: row.website || null,
            isArchived: row.isArchived === 'true',
            archivedAt: row.archivedAt ? new Date(row.archivedAt) : null,
          }
        })

        importedCount++

      } catch (error) {
        console.error(`Error processing row ${i + 1}:`, error)
        errors.push(`Row ${i + 1}: Processing error`)
      }
    }

    if (errors.length > 0 && importedCount === 0) {
      return NextResponse.json(
        { 
          error: 'No entities were imported due to errors',
          details: errors.slice(0, 10) // Limit error details
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      message: 'Import completed successfully',
      imported: importedCount,
      total: lines.length - 1,
      errors: errors.length > 0 ? errors.slice(0, 10) : undefined
    })

  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++ // Skip next quote
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last field
  result.push(current.trim())
  
  return result
}