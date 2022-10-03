const blogsRouter = require('express').Router()
const Blog= require('../models/blog')
const User= require('../models/user')
const jwt=require('jsonwebtoken')

const getTokenFrom= req => {
  const authorization = req.get('authorization')
  if(authorization && authorization.toLowerCase().startsWith('bearer ')) {
    return authorization.substring(7)
  }
  return null
}

blogsRouter.get('/',async (request, response) => {
  const blogs= await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id',async (req,res) => {
  const blog = await Blog.findById(req.params.id)

  if (blog) {
    res.json(blog.toJSON())
  } else {
    res.status(404).end()
  }
})



blogsRouter.post('/',async (req, res) => {
  const body = req.body

  const token = getTokenFrom(req)
  const decodedToken = jwt.verify(token, process.env.SECRET)
  if (!token || !decodedToken.id) {
    return res.status(401).json({ error: 'token missing or invalid' })
  }
  const user= await User.findById(decodedToken.id)

  const blog = new Blog({
    url: body.url,
    title: body.title,
    author:body.author,
    user: user,
    likes:body.likes,
  })
  const savedBlog= await blog.save()
  user.blogs= user.blogs.concat(savedBlog._id)
  console.log(user.blogs)
  await user.save()

  res.status(201).json(savedBlog)
})

blogsRouter.delete('/:id', async (request, res) => {
  await Blog.findByIdAndRemove(request.params.id)
  res.status(204).end()
})

blogsRouter.put('/:id',async (request, response) => {
  const body = request.body

  const blog = {
    url: body.url,
    title: body.title,
    author:body.author,
    user: body.user.id,
    likes:body.likes,
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  console.log(updatedBlog)
  response.json(updatedBlog)

})



module.exports=blogsRouter