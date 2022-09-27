const bcrypt= require('bcrypt')
const usersRouter= require('express').Router()
const User= require('../models/user')

usersRouter.post('/', async (req,res) => {
  const { username, name, password } = req.body
  const alreadyUsed= await User.findOne({ username })

  if(password.length < 3){
    return res.status(400).json({ error: 'password too short' })
  }

  if (alreadyUsed) {
    return res.status(400).json({ error: 'username already taken' })
  }
  const saltRounds=10
  const passwordHash= await bcrypt.hash(password,saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()

  res.status(201).json(savedUser)
})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs', { url:1,author:1,title:1 })

  response.json(users)
})

module.exports = usersRouter