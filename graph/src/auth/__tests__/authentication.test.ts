import { decode, sign } from "jws"
import { TokenContent } from "../../../../common/token-content-type"
import { verifyAndDecode } from "../authentication"

describe('authentication', () => {
    describe('createToken', () => {
        it('should append expiry to token content based on process.env.timeout', () => {
            process.env.timeout = '1'
            jest.resetModules()
            const createToken = require('../authentication').createToken

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
            const createToken = require('../authentication').createToken

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
            const createToken = require('../authentication').createToken

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
})