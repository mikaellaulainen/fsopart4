const blogsRouter = require('express').Router()
const Blog= require('../models/blog')
const User= require('../models/user')

blogsRouter.get('/',async (request, response) => {
  const blogs= await Blog.find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogsRouter.get('/:id',async (req,res) => {
  const blogs= await Blog
    .find({})
    .populate('user', { username:1,name:1 })

  res.json(blogs)
})


blogsRouter.post('/',async (req, res) => {
  const body = req.body
  const user= await User.findById(body.userId)

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


module.exports=blogsRouter