import { TContext } from "../../app";
import { STORED_PROC } from "../../../../common/database-constants";
import { hash, verify } from 'argon2'
import { createToken } from "../../auth/authentication";
import { checkAuthorization } from "../../auth/authorization";
import { passwordComplexityCheck } from '../../../../common/password-complexity'
import { CORE_GROUP } from "../../../../common/core-groups";

export default {
    Mutation: {
        login: async (parent, { userName, password }: { userName: string, password: string }, context: TContext, info) => {
            const { id, password_hash, password_reset_required }: { id: number, password_hash: string, password_reset_required: boolean } =
                await context.pool.query(`
                    SELECT *
                    FROM ${STORED_PROC.getUserLogin}('${userName}')
                `).then(result => result.rows[0] || {})

            if (password_hash && await verify(password_hash, password)) {
                const groups: string[] = await context.pool.query(`
                    SELECT *
                    FROM ${STORED_PROC.getUserGroup}(${id})
                `).then(result => result.rows.map(row => row.name))

                const token = createToken({
                    id,
                    userName,
                    groups
                })

                return {
                    id,
                    token,
                    password_reset_required,
                }
            }

            return {
            }
        },
        updatePassword: async (parent, { password }: { password: string }, context: TContext, info) => {
            checkAuthorization(context)
            const errors = passwordComplexityCheck(password)
            if (errors.length > 0) {
                return errors
            }

            const passwordHash = await hash(password)

            await context.pool.query(`
                SELECT 1
                FROM ${STORED_PROC.updatePassword}(${context.user.id}, '${passwordHash}')
            `)

            return []
        },
        resetPassword: async (parent, { userName, password }: { userName: string, password: string }, context: TContext, info) => {
            checkAuthorization(context, CORE_GROUP.Admin)

            const passwordHash = await hash(password)

            await context.pool.query(`
                SELECT 1
                FROM ${STORED_PROC.resetPassword}('${userName}', '${passwordHash}')
            `)

            return true
        }
    }
}