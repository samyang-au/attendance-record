import { config } from 'dotenv'
import { Client } from "pg"
import { DB_NAME, SCHEMA } from "../common/database-constants"
import { createStoredProc } from './create-stored-proc'
import { readPromise } from "./readPromise"

config()

async function main() {
    const user = process.env.user_name || await readPromise({ prompt: 'What is the database user name (default is "postgres")?' }) || 'postgres'
    const password = process.env.password || await readPromise({ prompt: 'Password:', silent: true, replace: '*' })

    let dbClient: Client
    try {
        dbClient = new Client({
            port: Number(process.env.port || '5432'),
            user,
            password,
            database: DB_NAME
        })
        dbClient.connect()

        await dropAllFunctions(dbClient)
        await createStoredProc(dbClient)
    } catch (e) {
        console.log(e)
    } finally {
        if (dbClient) {
            await dbClient.end()
        }
    }
}

async function dropAllFunctions(dbClient: Client) {
    const listOfFunctions: { routine_name: string }[] = await dbClient.query(`
        SELECT routines.routine_name
        FROM information_schema.routines
        WHERE routines.specific_schema='${SCHEMA}'
    `).then(result => result.rows)

    for (let functionName of listOfFunctions) {
        await dbClient.query(`
            DROP FUNCTION IF EXISTS "${SCHEMA}"."${functionName.routine_name}"
        `)
    }
}

main()