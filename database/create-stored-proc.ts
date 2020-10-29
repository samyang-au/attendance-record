import { Client } from "pg";
import { SCHEMA } from "../common/database-constants";
import { securityDefinerRole } from "./create-express-user";

export async function createStoredProc(dbClient: Client) {
    await dbClient.query(`
        CREATE FUNCTION "${SCHEMA}"."getUserLogin"(IN "userName" character varying)
            RETURNS TABLE(
                id smallint,
                user_name varchar(50),
                password text
            )
            LANGUAGE 'plpgsql'
            SECURITY DEFINER 
            
            SET search_path="${SCHEMA}"
        AS $BODY$
        BEGIN
            RETURN QUERY SELECT m.id, m.user_name, m.password
            FROM "${SCHEMA}"."member" m
            WHERE m.user_name = "userName";
        END;
        $BODY$;

        ALTER FUNCTION "${SCHEMA}"."getUserLogin"(character varying)
            OWNER TO ${securityDefinerRole};
    `)
}