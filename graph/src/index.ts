import { config } from 'dotenv'
import * as express from 'express'
import { ApolloServer, } from 'apollo-server-express'
import { typeDefs } from './schema'
import { resolvers } from './resolver'
import * as https from 'https'
import * as fs from 'fs'
import { Pool } from 'pg'
import { DB_NAME } from '../../common/database-constants'

config()

const pool = new Pool({
    host: 'localhost',
    user: process.env.user_name,
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    database: DB_NAME,
    password: process.env.password,
    port: Number(process.env.port),
})

export type TContext = {
    pool: Pool
}
const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }): TContext => {
        return {
            pool
        }
    }
})

const app = express()
apollo.applyMiddleware({ app })

const server = https.createServer({
    key: fs.readFileSync('./server.key'),
    cert: fs.readFileSync('./server.crt')
}, app)

server.listen({ port: 433 })
console.log('listening to port 433')

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server')
    server.close(() => {
        console.log('HTTP server closed')
    })
})