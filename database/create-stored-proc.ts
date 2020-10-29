import { Client } from "pg";
import { SCHEMA, STORED_PROC } from "../common/database-constants";
import { securityDefinerRole } from "./create-express-user";

export async function createStoredProc(dbClient: Client) {
    await dbClient.query(`
        CREATE FUNCTION ${STORED_PROC.getUserLogin}(IN "userName" character varying)
            RETURNS TABLE(
                id smallint,
                password_hash text,
                password_reset_required boolean
            )
            LANGUAGE 'plpgsql'
            SECURITY DEFINER 
            
            SET search_path="${SCHEMA}"
        AS $BODY$
        BEGIN
            RETURN QUERY
            SELECT m.id, m.password_hash, m.password_reset_required
            FROM "${SCHEMA}"."member" m
            WHERE m.user_name = "userName";
        END;
        $BODY$;

        ALTER FUNCTION ${STORED_PROC.getUserLogin}(character varying)
            OWNER TO ${securityDefinerRole};
    `)

    await dbClient.query(`
        CREATE FUNCTION ${STORED_PROC.getUserGroup}(IN "userId" int)
            RETURNS TABLE(
                group_name varchar(30)
            )
            LANGUAGE 'plpgsql'
            SECURITY DEFINER 
            
            SET search_path="${SCHEMA}"
        AS $BODY$
        BEGIN
            RETURN QUERY
            SELECT g.group_name
            FROM "attendance-record"."group_member" gm
                LEFT JOIN "attendance-record"."group" g ON gm.group_id = g.id
            WHERE gm.member_id = 1
                AND gm.end_date IS NULL
                AND g.end_date IS NULL
                AND g.parent_id IS NULL;
            END;
        $BODY$;

        ALTER FUNCTION ${STORED_PROC.getUserGroup}(int)
            OWNER TO ${securityDefinerRole};
    `)
}