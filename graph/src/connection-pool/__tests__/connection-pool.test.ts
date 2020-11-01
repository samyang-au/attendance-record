import { Pool } from "pg";
import { STORED_PROC } from "../../../../common/database-constants";
import { createConnectionPool } from "../connection-pool"

describe('connection-pool', () => {
    let pool: Pool;

    beforeAll(() => {
        pool = createConnectionPool()
    })

    afterAll(() => {
        if (pool) {
            pool.end()
            pool = undefined
        }
    })

    it('should create connection with limited access', async () => {
        await expect(
            pool.query(`
                SELECT *
                FROM "attendance-record"."member"
            `)
        ).rejects.toThrow('permission denied for table member')

        await expect(
            pool.query(`
                SELECT *
                FROM ${STORED_PROC.getUserLogin}('admin')
            `).then(() => 1)
        ).resolves.toBe(1)
    })
})