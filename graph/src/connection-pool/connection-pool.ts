import { Pool } from "pg";
import { DB_NAME } from "../../../common/database-constants";

export const createConnectionPool = () =>
    new Pool({
        host: 'localhost',
        user: process.env.user_name,
        max: 10,
        min: 2,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
        database: DB_NAME,
        password: process.env.password,
        port: Number(process.env.port),
    })
