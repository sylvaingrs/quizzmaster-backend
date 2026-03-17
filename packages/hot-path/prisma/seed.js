import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client.js'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

await prisma.quiz.create({
  data: {
    id: 'quiz-1',
    title: 'Quiz JS',
    questions: {
      create: [
        {
          id: 'question-1',
          title: "C'est quoi Node.js ?",
          options: ['Runtime', 'Framework', 'Base de données'],
          correctAnswer: 'Runtime'
        }
      ]
    }
  }
})

console.log('Seed OK ✅')
await prisma.$disconnect()
