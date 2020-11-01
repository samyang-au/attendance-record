import { TContext } from "../app";
import { STORED_PROC } from "../../../common/database-constants";
import * as argon2 from 'argon2'
import { ApolloError } from 'apollo-server-express'
import { decode, sign, verify } from 'jws'

const TIMEOUT = (Number(process.env.timeout) || 15) * 60000 // default to 15 min

export type TokenContent = {
    id: number,
    userName: string,
    groups: string[],
    expiry: number
}

export const createToken = (content: Omit<TokenContent, 'expiry'>) =>
    sign({
        header: { alg: 'HS256' },
        secret: process.env.secret,
        payload: {
            ...content,
            expiry: Date.now() + TIMEOUT
        },
    })

export const verifyAndDecode = (authHeader?: string): TokenContent | undefined => {
    if (authHeader) {
        if (verify(authHeader, 'HS256', process.env.secret)) {
            const content = JSON.parse(decode(authHeader).payload) as TokenContent

            if (content.expiry < Date.now()) {
                throw new ApolloError('Unauthorized', '403')
            }

            return content
        } else {
            throw new ApolloError('Unauthorized', '403')
        }
    }

    return undefined
}

export default {
    Query: {
        login: async (parent, { userName, password }: { userName: string, password: string }, context: TContext, info) => {
            const { id, password_hash, password_reset_required }: { id: number, password_hash: string, password_reset_required: boolean } =
                await context.pool.query(`
                    SELECT *
                    FROM ${STORED_PROC.getUserLogin}('${userName}')
                `).then(result => result.rows[0] || {})

            if (password_hash && await argon2.verify(password_hash, password)) {
                const groups: string[] = await context.pool.query(`
                    SELECT *
                    FROM ${STORED_PROC.getUserGroup}(${id})
                `).then(result => result.rows.map(row => row.group_name))

                const token = createToken({
                    id,
                    userName,
                    groups
                })

                return {
                    id,
                    token,
                    passwordResetRequired: password_reset_required,
                }
            }

            return {
            }
        },
        // updatePassword: async (parent, { password }: { password: string }, context: TContext, info) => {

        // }
    }
}