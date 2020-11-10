import { Pool } from "pg"
import { rollbackTransaction, startTransaction } from "../../test-helper"
import resolver from "../auth-resolver"
import * as argon2 from 'argon2'
import { SCHEMA } from "../../../../common/database-constants"
import { CORE_GROUP } from "../../../../common/core-groups"
import { verifyAndDecode } from "../../auth/authentication"
import { TokenContent } from "../../../../common"

describe('auth-resolver', () => {
    describe('login resolver', () => {
        let pool: Pool
        let testUserId: number

        beforeAll(async () => {
            pool = await startTransaction()
            const adminPasswordHash = await argon2.hash('password')
            testUserId = await pool.query(`
                INSERT INTO "${SCHEMA}"."member" (
                    english_given_name,
                    user_name,
                    password_hash,
                    password_reset_required,
                    inactive
                ) VALUES (
                    'Test User',
                    'test_user',
                    '${adminPasswordHash}',
                    true,
                    true
                ) RETURNING id
            `).then(result => Number(result.rows[0].id))

            const usherGroupId = await pool.query(`
                SELECT id
                FROM "${SCHEMA}"."group"
                WHERE name = '${CORE_GROUP.Usher}'
            `).then(result => result.rows[0].id)

            await pool.query(`
                INSERT INTO "${SCHEMA}"."group_member" (
                    group_id,
                    member_id,
                    start_date,
                    order_id
                ) VALUES (
                    ${usherGroupId},
                    ${testUserId},
                    '2020-1-1',
                    1
                )
            `)
        })

        afterAll(async () => {
            await rollbackTransaction(pool)
        })

        it('should return empty object if user name is not found', async () => {
            const result = await resolver.Mutation.login(
                undefined,
                { userName: 'invalid', password: 'password' },
                { pool },
                undefined
            )

            expect(result).toEqual({})
        })

        it('should return empty object if password is invalid', async () => {
            const result = await resolver.Mutation.login(
                undefined,
                { userName: 'test_user', password: 'invalid' },
                { pool },
                undefined
            )

            expect(result).toEqual({})
        })

        it('should return login object when user name and password is vaild', async () => {
            const result = await resolver.Mutation.login(
                undefined,
                { userName: 'test_user', password: 'password' },
                { pool },
                undefined
            )

            const token = verifyAndDecode(result.token)

            expect(result.id).toBe(testUserId)
            expect(token.id).toBe(testUserId)
            expect(token.userName).toBe('test_user')
            expect(token.groups).toEqual(['Usher'])
            expect(result.password_reset_required).toBe(true)
        })
    })

    describe('updatePassword', () => {
        let pool: Pool
        let testUserId: number

        beforeAll(async () => {
            pool = await startTransaction()
            const adminPasswordHash = await argon2.hash('password')
            testUserId = await pool.query(`
                INSERT INTO "${SCHEMA}"."member" (
                    english_given_name,
                    user_name,
                    password_hash,
                    password_reset_required,
                    inactive
                ) VALUES (
                    'Test User',
                    'test_user',
                    '${adminPasswordHash}',
                    true,
                    true
                ) RETURNING id
            `).then(result => Number(result.rows[0].id))
        })

        afterAll(async () => {
            await rollbackTransaction(pool)
        })

        it('should fail if context.user is undefined', async () => {
            await expect(async () => {
                await resolver.Mutation.updatePassword(
                    undefined,
                    { password: 'password' },
                    { pool },
                    undefined
                )
            }).rejects.toThrow('Unauthorized')
        })

        it('should return a list of errors if password complexity rules are not met', async () => {
            const errors = await resolver.Mutation.updatePassword(
                undefined,
                { password: 'password' },
                { pool, user: { id: testUserId } as TokenContent },
                undefined
            )
            expect(errors.length).toBeGreaterThan(0)
        })

        it('should set password_hash field to password hash and password_reset_required to false', async () => {
            const password = '1aA!a2'
            const errors = await resolver.Mutation.updatePassword(
                undefined,
                { password },
                { pool, user: { id: testUserId } as TokenContent },
                undefined
            )
            expect(errors.length).toBe(0)

            const { password_hash, password_reset_required } = await pool.query(`
                SELECT password_hash, password_reset_required
                FROM "${SCHEMA}"."member"
                WHERE id = ${testUserId}
            `).then(result => result.rows[0] as { password_hash: string, password_reset_required: boolean })
            console.log({ password_hash, password_reset_required })

            expect(await argon2.verify(password_hash, password)).toBe(true)
            expect(password_reset_required).toBe(false)
        })
    })
})