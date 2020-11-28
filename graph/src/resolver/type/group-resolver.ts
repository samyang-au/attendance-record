import { STORED_PROC } from "../../../../common/database-constants";
import { TContext } from "../../app";

export default {
    Group: {
        group_members:  async (parent: { id: number }, args, context: TContext, info) =>
            parent.id && await context.pool.query(`
            SELECT *
            FROM ${STORED_PROC.getGroupMembers}(${parent.id})
        `).then(result => result.rows || []),
    }
}