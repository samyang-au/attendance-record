import { STORED_PROC } from "../../../../common/database-constants"
import { TContext } from "../../app"

type TParent = {
    id: number
}

export default {
    Login: {
        member_info: async (parent: TParent, args, context: TContext, info) =>
            parent.id && await context.pool.query(`
                SELECT *
                FROM ${STORED_PROC.getMember}(${parent.id})
            `).then(result => result.rows[0] || {}),
        groups: async (parent: TParent, args, context: TContext, info) =>
            parent.id && await context.pool.query(`
            SELECT *
            FROM ${STORED_PROC.getUserGroup}(${parent.id})
        `).then(result => result.rows || []),
    }
}