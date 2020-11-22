import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { typeDefs } from './schema'
import { resolvers } from './resolver'
import https from 'https'
import fs from 'fs'
import path from 'path'
import { Pool } from 'pg'
import { createConnectionPool } from './connection-pool/connection-pool'
import { verifyAndDecode } from './auth/authentication'
import { TokenContent } from '../../common/token-content-type'

export type TContext = {
    pool: Pool,
    user?: TokenContent
}

export const app = () => {
    const pool = createConnectionPool()

    const apollo = new ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }): TContext => {
            // console.log(req.body)
            return ({
                pool,
                user: verifyAndDecode(req.headers.authorization)
            })
        }
    })

    const expressApp = express()
    apollo.applyMiddleware({ app: expressApp })

    const server = https.createServer({
        key: fs.readFileSync('./server.key'),
        cert: fs.readFileSync('./server.crt'),
    }, expressApp)

    server.listen({ port: 443 })
    console.log('listening to port 443')

    process.on('SIGTERM', () => {
        console.log('SIGTERM signal received: closing HTTP server')
        server.close(() => {
            console.log('HTTP server closed')
        })
    })

    expressApp.use(express.static(path.resolve('../client/build')))
    expressApp.get('/*', (_, res) => {
        res.sendFile(path.resolve('../client/build/index.html'))
    })
}