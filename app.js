const config=require('./utils/config')
const express = require('express')
const app = express()
const cors=require('cors')
const mongoose=require('mongoose')
require('express-async-errors')

const blogsRouter =require('./controller/blogs')
const usersRouter= require('./controller/users')
const loginRouter= require('./controller/login')
const middleware= require('./utils/middleware')
const logger =require('./utils/logger')

logger.info('Connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB')
  })
  .catch((error) => {
    logger.error('Error connection to MongoDB: ', error.message)
  })

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/users', usersRouter)
app.use('/api/blogs', blogsRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports=app