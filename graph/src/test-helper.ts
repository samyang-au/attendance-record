import { Pool, PoolClient } from "pg";
import { DB_NAME } from "../../common/database-constants";

const superUserPool = new Pool({
    host: 'localhost',
    user: process.env.superuser_name,
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    database: DB_NAME,
    password: process.env.superuser_password,
    port: Number(process.env.port),
})

export const startTransaction = async () => {
    const client = await superUserPool.connect()
    await client.query('BEGIN TRANSACTION')
    // cast so it can be used as context Pool
    return client as unknown as Pool
}

export const rollbackTransaction = async (pool: Pool) => {
    // cast back to PoolCilent so we can release the connection
    const client = pool as unknown as PoolClient
    await client.query('ROLLBACK TRANSACTION;')
    client.release()
    await superUserPool.end()
}
