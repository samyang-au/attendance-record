import { app } from '../app'
import fetch from 'node-fetch'
import https from 'https'

describe('app', () => {
    it('should run without error', async (done) => {
        try {
            app()
            await fetch('https://localhost:433/graphql',
                {
                    agent: new https.Agent({
                        rejectUnauthorized: false

                    }),
                    method: 'post',
                    body: '{"operationName":null,"variables":{},"query":"{\n  login(userName: \"admin\", password: \"invalid\") {\n    id\n    token\n    passwordResetRequired\n  }\n}\n"}'
                }
            )
        } finally {
            process.emit("SIGTERM", "SIGTERM")
            setTimeout(() => {
                done()
            }, 300)
        }
    })
})