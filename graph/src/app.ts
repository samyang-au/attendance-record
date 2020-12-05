import express from 'express'
import { ApolloServer } from 'apollo-server-express'
import { typeDefs } from './schema'
import { resolvers } from './resolver'
import https from 'https'
import http from 'http'
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

    let server: https.Server | http.Server

    if(process.env.env === "prod") {
        server = https.createServer({
            key: fs.readFileSync('./privkey.pem', 'utf8'),
            cert: fs.readFileSync('./cert.pem', 'utf8'),
        }, expressApp)
        server.listen({ port: 443 })
    } else {
        server = http.createServer(expressApp)
        server.listen({ port: 80 })
        console.log('graph started on http://localhost/graphql')
    }

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