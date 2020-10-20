import { config } from 'dotenv'
import { Client } from 'pg'
import { DB_NAME } from '../common/database-constants'
import { createDatabase } from './create-database'
import { createExpressUser } from './create-express-user'
import { createTable } from './create-table'
import { readPromise } from './readPromise'
import { seedDatabase } from './seed-database'

config()

async function main() {
    const user = process.env.user_name || await readPromise({ prompt: 'What is the database user name (default is "postgres")?' }) || 'postgres'
    const password = process.env.password || await readPromise({ prompt: 'Password:', silent: true, replace: '*' })

    const databaseCreated = await createDatabase(user, password)

    if (databaseCreated) {
        let dbClient: Client;
        try {
            dbClient = new Client({
                port: Number(process.env.port),
                user,
                password,
                database: DB_NAME
            })
            dbClient.connect()
            console.log('connect to database ' + DB_NAME)

            await createTable(dbClient)
            await createExpressUser(dbClient)
            await seedDatabase(dbClient)
        } catch (e) {
            console.log(e)
        } finally {
            if (dbClient) {
                await dbClient.end()
            }
        }
    }

    console.log('done.')
    process.exit(0)
}

main()