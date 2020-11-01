import { decode, sign } from "jws"
import { Pool } from "pg"
import { rollbackTransaction, startTransaction } from "../../test-helper"
import resolver, { TokenContent, verifyAndDecode } from "../auth-resolver"
import * as argon2 from 'argon2'
import { SCHEMA } from "../../../../common/database-constants"

describe('auth-resolver', () => {
    describe('createToken', () => {
        it('should append expiry to token content based on process.env.timeout', () => {
            process.env.timeout = '1'
            jest.resetModules()
            const createToken = require('../auth-resolver').createToken

            Date.now = () => 1
            const token = createToken({
                id: 1,
                userName: 'user name',
                groups: ['admin', 'usher']
            })

            const content = JSON.parse(decode(token).payload) as TokenContent

            expect(content.expiry).toBe(60001)
            expect(content.groups).toEqual(['admin', 'usher'])
            expect(content.id).toBe(1)
            expect(content.userName).toBe('user name')
        })

        it('should use default of 15 min for timeout if process.env.timeout is not defined', () => {
            process.env.timeout = undefined
            jest.resetModules()
            const createToken = require('../auth-resolver').createToken

            Date.now = () => 1
            const token = createToken({
                id: 1,
                userName: 'user name',
                groups: ['admin', 'usher']
            })

            const content = JSON.parse(decode(token).payload) as TokenContent

            expect(content.expiry).toBe(900001)
        })
    })

    describe('verifyAndDecode', () => {
        it('should return undefined if authHeader is not provided', () => {
            const content = verifyAndDecode(undefined)
            expect(content).toBeUndefined()
        })

        it('should throw an error if token content has been tempered with', () => {
            expect(() => {
                verifyAndDecode('eyJhbGciOiJIUzI1NiJ9.eyJpZCI6MSwidXNlck5hbWUiOiJhZG1pbiIsImdyb3VwcyI6WyJBZG1pbiJdLCJleHBpcnkiOjE2MDQwNjYzODcwMzl9.4hJQmxyreHsvyJKj9jPAiTga61YL7JI7v_B2u1tlTjw')
            }).toThrowError('Unauthorized')
        })

        it('should throw an error if token has expired', () => {
            const token = sign({
                header: { alg: 'HS256' },
                secret: process.env.secret,
                payload: {
                    id: 1,
                    userName: 'user name',
                    groups: ['admin', 'usher'],
                    expiry: Date.now() - 1000
                },
            })

            expect(() => {
                verifyAndDecode(token)
            }).toThrowError('Unauthorized')
        })

        it('should return the content of the token when the token is valid', () => {
            process.env.timeout = '1'
            jest.resetModules()
            const createToken = require('../auth-resolver').createToken

            Date.now = () => 1
            const token = createToken({
                id: 1,
                userName: 'user name',
                groups: ['admin', 'usher']
            })

            const content = verifyAndDecode(token)

            expect(content.expiry).toBe(60001)
            expect(content.groups).toEqual(['admin', 'usher'])
            expect(content.id).toBe(1)
            expect(content.userName).toBe('user name')
        })
    })

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

            await pool.query(`
                INSERT INTO "${SCHEMA}"."group_member" (
                    group_id,
                    member_id,
                    start_date,
                    order_id
                ) VALUES (
                    1,
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
            const result = await resolver.Query.login(undefined, { userName: 'invalid', password: 'password' }, { pool }, undefined)

            expect(result).toEqual({})
        })

        it('should return empty object if password is invalid', async () => {
            const result = await resolver.Query.login(undefined, { userName: 'test_user', password: 'invalid' }, { pool }, undefined)

            expect(result).toEqual({})
        })

        it('should return login object when user name and password is vaild', async () => {
            const result = await resolver.Query.login(undefined, { userName: 'test_user', password: 'password' }, { pool }, undefined)

            const token = verifyAndDecode(result.token)

            expect(result.id).toBe(testUserId)
            expect(token.id).toBe(testUserId)
            expect(token.userName).toBe('test_user')
            expect(token.groups).toEqual(['Admin'])
            expect(result.passwordResetRequired).toBe(true)
        })
    })
})