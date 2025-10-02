import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  try {
    console.log('Starting to clear database...')
    
    // Delete all revenues first (due to foreign key constraint)
    const deleteRevenues = await prisma.revenue.deleteMany({})
    console.log(`Deleted ${deleteRevenues.count} revenues`)
    
    // Delete all entities
    const deleteEntities = await prisma.entity.deleteMany({})
    console.log(`Deleted ${deleteEntities.count} entities`)
    
    console.log('Database cleared successfully!')
    
  } catch (error) {
    console.error('Error clearing database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

clearDatabase()