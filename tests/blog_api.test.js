const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const bcrypt= require('bcrypt')
const helper= require('./test_help')
const Blog= require('../models/blog')
const User = require('../models/users')
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
describe('Enough blogs, and format is JSON', () => {
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
})

describe('Testing adding blogs', () => {
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
})

describe('Deleting blog', () => {
  test('succeeds with status code 204 if id is valid', async () => {
    const blogs = await Blog.find({})
    const blogsAtStart= blogs.map(blog => blog.toJSON())
    const blogToDelete = blogsAtStart[0]
    await api
      .delete(`/api/blogs/${blogToDelete._id}`)
      .expect(204)

    const blogsAtEnd = await Blog.find({})

    expect(blogsAtEnd).toHaveLength(
      initialBlogs.length
    )

    const authors = blogsAtEnd.map(r => r.author)

    expect(authors).not.toContain(blogToDelete.author)
  })
})

describe('After adding first user to db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash=await bcrypt.hash('salainen', 10)
    const user = new User({ username: 'root', passwordHash })
    await user.save()
  })
  test('You can add new user', async () => {
    const usersAtbeginning =await helper.usersInDb()

    const newUser= {
      username: 'Testi mies',
      name:'Maker mies',
      password:'topsecret',
    }
    await api
      .post('/api/users')
      .send(newUser).expect(201)
      .expect('Content-Type', /application\/json/)
    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtbeginning.length+1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  test('Your password must atleast 3 characters',async () => {
    const newUser= {
      username:'New user',
      name:'New me',
      password:'me'
    }
    await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
  })
  test('Adding new user with already taken username, fails', async () => {
    const newUser= {
      username: 'root',
      name:'Maker mies',
      password:'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(result.body.error).toContain('username already taken')
  })
})

afterAll(() => {
  mongoose.connection.close()
})