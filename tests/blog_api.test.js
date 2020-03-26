const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const testData = require('../utils/testdata')


describe('GET /api/blogs', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})
    await Blog.insertMany(testData.listWithMultipleBlogs)
  })

  test('all blogs are returned in json format', async () => {
    await api.get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  }),

  test('the amount of returned blogs is correct', async () => {
    const response = await api.get('/api/blogs') 
    expect(response.body.length).toBe(testData.listWithMultipleBlogs.length)
  })
})

describe('POST /api/blogs', () => {
  test('a new blog is added', async () => {
    const newBlog = {
      title: 'How To Run A Successful Remote User Study',
      author: 'John',
      url: 'https://theuxblog.com/blog/remote-user-testing',
      likes: 3
    }
    await api.post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const response = await api.get('/api/blogs')
    const titles = response.body.map(b => b.title)

    expect(response.body.length).toBe(testData.listWithMultipleBlogs.length + 1)
    expect(titles).toContain('How To Run A Successful Remote User Study')
  })

  test('POST fails if title is empty', async () => {
    const noTitle = {
      author: 'John',
      url: 'https://theuxblog.com/blog/remote-user-testing'
    }
    await api.post('/api/blogs')
      .send(noTitle)
      .expect(400)
  })
  
  test('POST fails if url is empty', async () => {
    const noUrl = {
      author: 'John',
      title: 'How To Run A Successful Remote User Study'
    }
    await api.post('/api/blogs')
      .send(noUrl)
      .expect(400)
  })
})

test('id format is correct', async () => {
  const blogs = await api.get('/api/blogs')
  blogs.body.map(b => expect(b.id).toBeDefined())
})

test('the amount of likes equals 0 if value is not set', async () => {
  const noLikesSet = {
    title: 'How To Run A Successful Remote User Study',
    author: 'John',
    url: 'https://theuxblog.com/blog/remote-user-testing'
  }
  const response = await api.post('/api/blogs').send(noLikesSet)
  const blog = await api.get(`/api/blogs/${response.body.id}`)
  expect(blog.body.likes).toBe(0)
})



afterAll(() => {
  mongoose.connection.close()
})