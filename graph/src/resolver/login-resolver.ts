import { TContext } from "..";
import { STORED_PROC } from "../../../common/database-constants";
import * as argon2 from 'argon2'
import { sign } from 'jws'

export default {
    Query: {
        login: async (parent, { userName, password }: { userName: string, password: string }, context: TContext, info) => {
            const { id, password_hash, password_reset_required }: { id: number, password_hash: string, password_reset_required: boolean } =
                await context.pool.query(`
                    SELECT *
                    FROM ${STORED_PROC.getUserLogin}('${userName}')
                `).then(result => result.rows[0] || {})

            if (argon2.verify(password_hash, password)) {
                const groups: string[] = await context.pool.query(`
                    SELECT *
                    FROM ${STORED_PROC.getUserGroup}(${id})
                `).then(result => result.rows.map(row => row.group_name))

                const token = sign({
                    header: { alg: 'HS256' },
                    secret: process.env.secret,
                    payload: {
                        id,
                        userName,
                        groups
                    }
                })

                return {
                    id,
                    token,
                    passwordResetRequired: password_reset_required,
                    status: true
                }
            }
            return {
                status: false
            }
        }
    }
}