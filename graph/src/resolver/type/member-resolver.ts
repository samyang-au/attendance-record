import { STORED_PROC } from "../../../../common/database-constants";
import { TContext } from "../../app";

export default {
    Member: {
        member_type: async (parent: { member_type_id: number }, args, context: TContext, info) =>
            parent.member_type_id && await context.pool.query(`
                SELECT *
                FROM ${STORED_PROC.getMemberType}(${parent.member_type_id})
            `).then(result => result.rows[0] || {}),
        security_groups: async (parent: { id: number }, args, context: TContext, info) =>
            parent.id && await context.pool.query(`
            SELECT *
            FROM ${STORED_PROC.getSecurityGroup}(${parent.id})
        `).then(result => result.rows || []),
        family: async (parent: { id: number }, args, context: TContext, info) =>
            parent.id && await context.pool.query(`
            SELECT *
            FROM ${STORED_PROC.getFamily}(${parent.id})
        `).then(result => result.rows || []),
        attendance_group: async (parent: { id: number }, args, context: TContext, info) =>
            parent.id && await context.pool.query(`
            SELECT *
            FROM ${STORED_PROC.getAttendanceGroup}(${parent.id})
        `).then(result => result.rows || []),
    }
}