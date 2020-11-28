import { STORED_PROC } from "../../../../common/database-constants";
import { TContext } from "../../app";
import { getMemberHandler } from "../handler/get-member-handler";

export default {
    GroupMember: {
        group: async (parent: {group_id: string}, args, context: TContext, info) =>
            await context.pool.query(`
                SELECT *
                FROM ${STORED_PROC.getGroup}(${parent.group_id})
            `).then(result => result.rows[0] || {}),
        member: async (parent: {member_id: string}, args, context: TContext, info) =>
            await getMemberHandler(parent.member_id, context)
    }
}