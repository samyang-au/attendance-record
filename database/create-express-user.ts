import { Client } from "pg";
import { v4 as uuid } from 'uuid'
import * as fs from 'fs'
import { SCHEMA } from "../common/database-constants";

export async function createExpressUser(dbClient: Client) {
    const userName = 'node_user'
    const userExists = await dbClient.query(`
            SELECT 1 FROM pg_roles WHERE rolname='${userName}'
        `).then(value => value.rowCount === 1)

    if (!userExists) {
        console.log(`create ${userName}`)
        const password = uuid()
        await dbClient.query(`
                CREATE USER ${userName} WITH LOGIN NOCREATEDB NOSUPERUSER NOCREATEROLE NOINHERIT NOREPLICATION ENCRYPTED PASSWORD '${password}';
            `)
        fs.writeFileSync('../graph/.env', `user_name=${userName}\npassword=${password}\nport=${process.env.port}`)
        console.log('user credential ')
    }

    console.log(`grant execute permission to ${userName}`)
    dbClient.query(`
        GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA "${SCHEMA}" TO "${userName}"
    `)
}