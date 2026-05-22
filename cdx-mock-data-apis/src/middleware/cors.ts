import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: ['http://localhost:4200', 'http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:4200'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Mock-Scenario'],
  maxAge: 86400,
})
