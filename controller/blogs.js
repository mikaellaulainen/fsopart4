const blogsRouter = require('express').Router()
const Blog= require('../models/blog')

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

blogsRouter.get('/:id', (req,res) => {
  Blog
    .find({})
    .then(blogs => {
      res.json(blogs.find(blog => blog.id === req.params.id))
    })
})


blogsRouter.post('/', (request, response) => {
  const blog = new Blog(request.body)

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})

blogsRouter.delete('/:id', async (request, res) => {
  await Blog.findByIdAndRemove(request.params.id)
  res.status(204).end()
})


module.exports=blogsRouter