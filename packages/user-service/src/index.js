import Fastify from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import { prisma } from '@quizzmaster-backend/prisma/src/prisma.js'
import crypto from 'crypto'

const app = Fastify({ logger: true })

await app.register(swagger, {
  openapi: {
    info: {
      title: 'User Service API',
      description: 'API for creating and joining rooms',
      version: '1.0.0'
    },
  }
})

await app.register(swaggerUi, {
  routePrefix: '/docs',
})

// Helper to generate a 6-char MD5-based room id
async function generateRoomCode() {
  let code = ''
  let isUnique = false
  while (!isUnique) {
    const hash = crypto.createHash('md5').update(Date.now().toString() + Math.random().toString()).digest('hex')
    code = hash.substring(0, 6).toUpperCase()
    
    // Check collision in db
    const existing = await prisma.room.findUnique({ where: { id: code } })
    if (!existing) {
      isUnique = true
    }
  }
  return code
}

app.get('/health', (req, res) => {
    return { status: 'OK', alive: true }
})

// Schema for Room Creation
const createRoomSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['pseudo', 'quizId'],
            properties: {
                pseudo: { type: 'string' },
                quizId: { type: 'number' }
            }
        },
        response: {
            201: {
                type: 'object',
                properties: {
                    roomId: { type: 'string' },
                    pseudo: { type: 'string' },
                    role: { type: 'string' }
                }
            }
        }
    }
}

app.post('/rooms', createRoomSchema, async (req, res) => {
    const { pseudo, quizId } = req.body

    try {
        const roomId = await generateRoomCode()

        const room = await prisma.room.create({
            data: {
                id: roomId,
                quizId: quizId,
                status: 'WAITING',
                players: {
                    create: {
                        name: pseudo,
                        role: 'GAMEMASTER'
                    }
                }
            },
            include: { players: true }
        })

        return res.status(201).send({ 
            roomId: room.id, 
            pseudo: pseudo, 
            role: 'GAMEMASTER' 
        })
    } catch (error) {
        app.log.error(error)
        return res.status(500).send({ error: 'Failed to create room' })
    }
})

// Schema for Joining Room
const joinRoomSchema = {
    schema: {
        params: {
            type: 'object',
            required: ['roomId'],
            properties: {
                roomId: { type: 'string' }
            }
        },
        body: {
            type: 'object',
            required: ['pseudo'],
            properties: {
                pseudo: { type: 'string' }
            }
        },
        response: {
            200: {
                type: 'object',
                properties: {
                    roomId: { type: 'string' },
                    pseudo: { type: 'string' },
                    role: { type: 'string' }
                }
            }
        }
    }
}

app.post('/rooms/:roomId/join', joinRoomSchema, async (req, res) => {
    const { roomId } = req.params
    const { pseudo } = req.body

    try {
        const room = await prisma.room.findUnique({
            where: { id: roomId }
        })

        if (!room) {
            return res.status(404).send({ error: 'Room not found' })
        }

        const role = room.status === 'WAITING' ? 'PLAYER' : 'SPECTATOR'

        const player = await prisma.player.create({
            data: {
                roomId: roomId,
                name: pseudo,
                role: role
            }
        })

        return res.send({
            roomId: roomId,
            pseudo: player.name,
            role: player.role
        })
    } catch (error) {
        app.log.error(error)
        if (error.code === 'P2002') {
             return res.status(400).send({ error: 'Pseudo already taken in this room' })
        }
        return res.status(500).send({ error: 'Failed to join room' })
    }
})

app.post('/gateway-user', async (req, res) => {

    const { data } = req.body
    console.log('user-service data : ', data)

    const result = await fetch('http://localhost:3002/user-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data }),
    })

    const r = await result.json()
    console.log('user-service result : ', r)

    return { status: 'OK' }

})

await app.listen({ port: 3001, host: '0.0.0.0' })