import 'jest'
import * as request from 'supertest'
import { Server } from '../server/server'
import { environment } from '../commons/environment'
import { usersRouter } from '../users/users.router'
import { User } from './users.model'

let server: Server
let address: string
beforeAll(() => {
    environment.db.url = process.env.DB_URL || 'mongodb://localhost/meat-api-test-db'
    environment.server.port = process.env.SERVER_PORT || 3001
    address = `http://localhost:${environment.server.port}`
    server = new Server()
    return server.bootstrap([usersRouter])
        .then(() => User.remove({}).exec())
        .catch(console.error)
})

test('get /users', () => {
    return request(address)
        .get('/users')
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body.items).toBeInstanceOf(Array)
        }).catch(fail)
})

test('post /users', () => {
    return request(address)
        .post('/users')
        .send({
            name: 'Joao',
            email: 'joao@gmail.com',
            gender: 'Male',
            password: 123456,
            cpf: '092.976.446-35'
        })
        .then(response => {
            expect(response.status).toBe(200)
            expect(response.body._id).toBeDefined()
            expect(response.body.name).toBe('Joao')
            expect(response.body.email).toBe('joao@gmail.com')
            expect(response.body.cpf).toBe('092.976.446-35')
            expect(response.body.gender).toBe('Male')
            expect(response.body.password).toBeUndefined()
        }).catch(fail)
})

test('get users/aaaa - not found', () => {
    return request(address)
        .get('/users/aaaa')
        .then(response => {
            expect(response.status).toBe(404)
        }).catch(fail)
})

test('patch users/:id', () => {
    return request(address)
        .post('/users')
        .send({
            name: 'Jose',
            email: 'jose@gmail.com',
            password: 123456,
        })
        .then(response => request(address).patch(`/users/${response.body._id}`)
            .send({
                name: 'Jose da silva'
            })
            .then(response => {
                expect(response.status).toBe(200)
                expect(response.body.password).toBeUndefined()
                expect(response.body._id).toBeDefined()
                expect(response.body.name).toBe('Jose da silva')
                expect(response.body.email).toBe('jose@gmail.com')
            })
        ).catch(fail)
})

afterAll(() => {
    return server.shutdown()
})