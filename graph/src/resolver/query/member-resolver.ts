import { STORED_PROC } from "../../../../common/database-constants";
import { TContext } from "../../app";
import { checkAuthorization } from "../../auth/authorization";

export default {
    Query: {
        members: async (parent, args, context: TContext, info) =>
            checkAuthorization(context) &&
            await context.pool.query(`
                SELECT *
                FROM ${STORED_PROC.getMembers}()
            `).then(result => result.rows || []),
        member: async (parent, args: { id: string }, context: TContext, info) =>
            checkAuthorization(context) &&
            await context.pool.query(`
                SELECT *
                FROM ${STORED_PROC.getMember}(${args.id})
            `).then(result => result.rows[0] || {}),
    }
}