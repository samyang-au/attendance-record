import { Client } from 'pg'
import { DB_NAME } from '../common/database-constants'
import { readPromise } from './readPromise'

const port = 5432

export async function createDatabase(user, password) {
    let pgClient: Client
    try {
        pgClient = new Client({
            port,
            user,
            password
        })

        await pgClient.connect()

        const dbExists = await pgClient.query(`
                SELECT FROM pg_database WHERE datname = '${DB_NAME}'
            `).then(value => value.rowCount === 1)

        if (dbExists) {
            const override = (await readPromise({ prompt: 'Database already exist, should I override it? (y/N)' }) as string).toLowerCase() === 'y'

            if (override) {
                console.log('deleting database')
                await pgClient.query(`
                    DROP DATABASE "${DB_NAME}"
                `)
            } else {
                console.log('No override')
                return false
            }
        }

        console.log('create database')
        await pgClient.query(`
                CREATE DATABASE "${DB_NAME}"
                    WITH
                    OWNER = postgres
                    ENCODING = 'UTF8'
                    CONNECTION LIMIT = -1;
            `)
        return true
    } catch (e) {
        console.log(e)
        return false
    } finally {
        if (pgClient) {
            await pgClient.end()
        }
    }
}
