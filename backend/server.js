// backend/server.js
import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import authRoutes from './routes/authRoutes.js'

dotenv.config()

const app = express()

// Middlewares
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json())

// Routes
app.use('/api/auth', authRoutes)

// Simple health check
app.get('/', (req, res) => {
  res.send('ClassForge API running')
})

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI

mongoose
  .connect(MONGODB_URI, {
    // options optional for new drivers, can be omitted if not needed
  })
  .then(() => {
    console.log('MongoDB connected')
    const PORT = process.env.PORT || 5001
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`)
    })
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err)
    process.exit(1)
  })
