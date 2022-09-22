const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const Blog= require('../models/blog')
jest.setTimeout(30000)

const initialBlogs=[
  {
    title: 'Canonil string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
  {
    title: 'First cls tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10
  }
]

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject= new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('There are all blogs', async () => {
  const response = await api.get('/api/blogs')

  expect(response.body).toHaveLength(initialBlogs.length)
})

test('You can add blogs', async () => {
  const newBlog = {
    _id: '5a422ba71b54a676234d17fb',
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
    __v: 0
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-type', /application\/json/)

  const res = await api.get('/api/blogs')

  const authors= res.body.map(r => r.author)

  expect(res.body).toHaveLength(initialBlogs.length + 1)
  expect(authors).toContain('Robert C. Martin')
})

test('succeeds with status code 204 if id is valid', async () => {
  const blogs = await Blog.find({})
  const blogsAtStart= blogs.map(blog => blog.toJSON())
  const blogToDelete = blogsAtStart[0]
  console.log(blogToDelete)
  await api
    .delete(`/api/blogs/${blogToDelete._id}`)
    .expect(204)

  const blogsAtEnd = await Blog.find({})

  expect(blogsAtEnd).toHaveLength(
    initialBlogs.length - 1
  )

  const authors = blogsAtEnd.map(r => r.author)

  expect(authors).not.toContain(blogToDelete.author)
})


afterAll(() => {
  mongoose.connection.close()
})