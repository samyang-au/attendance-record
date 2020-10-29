import * as express from 'express'
import { ApolloServer, } from 'apollo-server-express'
import { typeDefs } from './schema'
import { resolvers } from './resolver'
import * as https from 'https'
import * as fs from 'fs'

const apollo = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
        console.log(req.headers.authorization)
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