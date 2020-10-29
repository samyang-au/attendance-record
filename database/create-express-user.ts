import { Client } from "pg";
import { v4 as uuid } from 'uuid'
import * as fs from 'fs'
import { SCHEMA } from "../common/database-constants";

export const securityDefinerRole = 'security_definer_role'

export async function createExpressUser(dbClient: Client) {
    const securityDefinerRoleExists = await dbClient.query(`
        SELECT 1 FROM pg_roles WHERE rolname='${securityDefinerRole}'
    `).then(value => value.rowCount === 1)

    if (!securityDefinerRoleExists) {
        console.log(`create ${securityDefinerRole}`)
        await dbClient.query(`
            CREATE ROLE ${securityDefinerRole} WITH LOGIN NOCREATEDB NOSUPERUSER NOCREATEROLE NOINHERIT NOREPLICATION;
        `)
    }
    console.log(`grant permissions to ${securityDefinerRole}`)
    await dbClient.query(`
        GRANT USAGE ON SCHEMA "${SCHEMA}" TO "${securityDefinerRole}"
    `)
    await dbClient.query(`
        GRANT SELECT ON ALL TABLES
        IN SCHEMA "${SCHEMA}" TO "${securityDefinerRole}"
    `)
    await dbClient.query(`
        GRANT INSERT ON ALL TABLES
        IN SCHEMA "${SCHEMA}" TO "${securityDefinerRole}"
    `)
    await dbClient.query(`
        GRANT UPDATE ON ALL TABLES
        IN SCHEMA "${SCHEMA}" TO "${securityDefinerRole}"
    `)
    await dbClient.query(`
        GRANT DELETE ON ALL TABLES
        IN SCHEMA "${SCHEMA}" TO "${securityDefinerRole}"
    `)

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
        fs.writeFileSync('../graph/.env', `user_name=${userName}\npassword=${password}\nport=${process.env.port}\nsecret=${uuid()}`)
        console.log('user credential exported to graph .env')
    }

    console.log(`grant execute permission to ${userName}`)
    dbClient.query(`
        GRANT USAGE ON SCHEMA "${SCHEMA}" TO "${userName}"
    `)
    dbClient.query(`
        GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA "${SCHEMA}" TO "${userName}"
    `)
}
