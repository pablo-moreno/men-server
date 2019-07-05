import server from '../../server'
import request from 'supertest'
import mongoose from '../../mongoose'
import redisClient from '../../redisClient'
import { createMocks, destroyMocks } from './mocks'

describe('API calls', () => {
  let chewie = undefined

  beforeAll(async () => {
    const users = await createMocks()
    console.log('Users created: ', users.length)
    return users
  })

  afterAll(async (done) => {
    const results = await destroyMocks()
    console.log('Removed items:', results.n, results.ok ? 'OK' : 'ERROR')
    mongoose.disconnect()
    redisClient.quit()
    done()
  })

  test('Sign up', async () => {
    const response = await request(server)
      .post('/auth/sign-up')
      .send({ 
        username: 'chewie',
        password: 'gruaaargh',
        password2: 'gruaaargh',
        email: 'chewie@mail.com'
      })
    const user = response.body

    expect(response.status).toBe(201)
    expect(user.username).toBe('chewie')
    expect(user.email).toBe('chewie@mail.com')
  })

  test('Sign up error', async () => {
    const response = await request(server)
      .post('/auth/sign-up')
      .send({ 
        username: 'chewie',
        password: 'aaaahhh',
        password2: 'gruaaargh',
        email: 'chewie@mail.com'
      })

    expect(response.status).toBe(400)
  })

  test('Chewie Login', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({ 
        email: 'chewie@mail.com',
        password: 'gruaaargh',
      })
    const user = response.body
    
    expect(response.status).toBe(200)
    expect(user.username).toBe('chewie')
    expect(user.email).toBe('chewie@mail.com')
    expect(user.token).not.toBe(undefined)
    chewie = user
  })

  test('Login error', async () => {
    const response = await request(server)
      .post('/auth/login')
      .send({ 
        email: 'chewie@mail.com',
        password: 'aaaaahhhhh',
      })
    expect(response.status).toBe(400)
  })

  test('Get Me', async () => {
    const response = await request(server)
      .get('/auth/me')
      .set('x-auth', chewie.token)
    
    const user = response.body

    expect(user.username).toBe(chewie.username)
    expect(user.email).toBe(chewie.email)
    expect(user.token).toBe(chewie.token)
    chewie = user
  })

  test('Get Me error', async () => {
    const response = await request(server)
      .get('/auth/me')
      .set('x-auth', 'this token doesnt exist')
    
    expect(response.status).toBe(401)
  })

  test('Update user', async () => {
    const response = await request(server)
      .put('/auth/me')
      .set('x-auth', chewie.token)
      .send({
        firstName: 'Chewbacca'
      })
    
    const results = response.body
    expect(results.ok).toBe(1)
    expect(results.nModified).toBe(1)
      
    const getMe = await request(server)
      .get('/auth/me')
      .set('x-auth', chewie.token)
    
    const user = getMe.body
    expect(user.firstName).toBe('Chewbacca')
    chewie = user
  })
})
