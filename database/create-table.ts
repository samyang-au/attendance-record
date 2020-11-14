import { Client } from "pg";
import { SCHEMA } from "../common/database-constants";

export async function createTable(dbClient: Client) {
    console.log(`create schema "${SCHEMA}"`)
    await dbClient.query(`
            CREATE SCHEMA "${SCHEMA}" AUTHORIZATION postgres
        `)

    console.log('create version table')
    await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."version"
            (
                "version_no" smallint NOT NULL
            );

            ALTER TABLE "${SCHEMA}"."version"
                OWNER to postgres;
        `)
    await dbClient.query(`
            INSERT INTO "${SCHEMA}"."version"
            VALUES (1)
        `)

    console.log('create member type table')
    await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."member_type"
            (
                id smallserial,
                name varchar(20) UNIQUE NOT NULL,
                PRIMARY KEY (id)
            );

            ALTER TABLE "${SCHEMA}"."member_type"
                OWNER to postgres;
        `)

    console.log('create address table')
    await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."address"
            (
                id smallserial,
                street text,
                suburb text,
                state varchar(3),
                postcode varchar(4),
                PRIMARY KEY (id)
            );

            ALTER TABLE "${SCHEMA}"."address"
                OWNER to postgres;
        `)

    console.log('create member table')
    await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."member"
            (
                id smallserial,
                english_given_name text,
                english_surname text,
                chinese_given_name text,
                chinese_surname text,
                alias text,
                email text UNIQUE,
                user_name varchar(50) UNIQUE,
                password_hash text,
                password_reset_required boolean,
                legacy_id varchar(20) UNIQUE,
                gender character(1),
                member_type_id smallint,
                address_id smallint,
                inactive boolean,
                deceased boolean,
                notes text,
                PRIMARY KEY (id),
                CONSTRAINT member_type_id_constraint FOREIGN KEY (member_type_id)
                    REFERENCES "${SCHEMA}".member_type (id) MATCH SIMPLE,
                CONSTRAINT address_id_constraint FOREIGN KEY (address_id)
                    REFERENCES "${SCHEMA}".address (id) MATCH SIMPLE
            );

            ALTER TABLE "${SCHEMA}"."member"
                OWNER to postgres;
        `)

    console.log('create group table')
    await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."group"
            (
                id smallserial,
                name varchar(30),
                start_date date NOT NULL,
                end_date date,
                parent_id smallint,
                order_id smallint,
                PRIMARY KEY (id),
                CONSTRAINT parent_id_constraint FOREIGN KEY (parent_id)
                    REFERENCES "${SCHEMA}".group (id) MATCH SIMPLE
            );

            ALTER TABLE "${SCHEMA}"."group"
                OWNER to postgres;
        `)

    console.log('create group member table')
    await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."group_member"
            (
                id smallserial,
                group_id smallint NOT NULL,
                member_id smallint NOT NULL,
                start_date date NOT NULL,
                end_date date,
                order_id smallint,
                PRIMARY KEY (id),
                CONSTRAINT group_id_constraint FOREIGN KEY (group_id)
                    REFERENCES "${SCHEMA}".group (id) MATCH SIMPLE,
                CONSTRAINT member_id_constraint FOREIGN KEY (member_id)
                    REFERENCES "${SCHEMA}".member (id) MATCH SIMPLE
            );

            ALTER TABLE "${SCHEMA}"."group_member"
                OWNER to postgres;
        `)

    console.log('create record table')
    await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."record"
            (
                id smallserial,
                group_id smallint NOT NULL,
                date date NOT NULL,
                PRIMARY KEY (id),
                CONSTRAINT group_id_constraint FOREIGN KEY (group_id)
                    REFERENCES "${SCHEMA}".group (id) MATCH SIMPLE
            );

            ALTER TABLE "${SCHEMA}"."record"
                OWNER to postgres;
        `)

    console.log('create record field table')
    await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."record_field"
            (
                id smallserial,
                record_id smallint NOT NULL,
                name text NOT NULL,
                value text NOT NULL,
                PRIMARY KEY (id),
                CONSTRAINT record_id_constraint FOREIGN KEY (record_id)
                    REFERENCES "${SCHEMA}".record (id) MATCH SIMPLE
            );

            ALTER TABLE "${SCHEMA}"."record_field"
                OWNER to postgres;
        `)

    console.log('create attendance table')
    await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."attendance"
            (
                id smallserial,
                record_id smallint NOT NULL,
                member_id smallint NOT NULL,
                PRIMARY KEY (id),
                CONSTRAINT record_id_constraint FOREIGN KEY (record_id)
                    REFERENCES "${SCHEMA}".record (id) MATCH SIMPLE,
                CONSTRAINT member_id_constraint FOREIGN KEY (member_id)
                    REFERENCES "${SCHEMA}".member (id) MATCH SIMPLE
            );

            ALTER TABLE "${SCHEMA}"."attendance"
                OWNER to postgres;
        `)

    console.log('create offering table')
    await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."offering"
            (
                id smallserial,
                group_id smallint NOT NULL,
                date date NOT NULL,
                amount money NOT NULL,
                PRIMARY KEY (id),
                CONSTRAINT group_id_constraint FOREIGN KEY (group_id)
                    REFERENCES "${SCHEMA}".group (id) MATCH SIMPLE
            );

            ALTER TABLE "${SCHEMA}"."offering"
                OWNER to postgres;
        `)
}