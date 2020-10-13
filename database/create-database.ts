import { Client } from 'pg'
import { DB_NAME, SCHEMA } from '../common/database-constants'
import { readPromise } from './readPromise'
import { v4 as uuid } from 'uuid'
import * as fs from 'fs'

const port = 5432

async function createDatabase(user, password) {
    try {
        const pgClient = new Client({
            port,
            user,
            password
        })

        await pgClient.connect()

        const dbExists = await pgClient.query(`
                SELECT FROM pg_database WHERE datname = '${DB_NAME}'
            `).then(value => value.rowCount === 1)

        if (dbExists) {
            const override = (await readPromise({ prompt: 'Database already exist, should I override it? (y/N)' }) as string).toLowerCase() === 'y'

            if (override) {
                console.log('deleting database')
                await pgClient.query(`
                    DROP DATABASE "${DB_NAME}"
                `)
            } else {
                console.log('No override')
                return
            }
        }

        console.log('create database')
        await pgClient.query(`
                CREATE DATABASE "${DB_NAME}"
                    WITH
                    OWNER = postgres
                    CONNECTION LIMIT = -1;
            `)
        await pgClient.end()

        console.log('connect to database ' + DB_NAME)
        const dbClient = new Client({
            port,
            user,
            password,
            database: DB_NAME
        })
        dbClient.connect()

        console.log(`create schema "${SCHEMA}"`)
        await dbClient.query(`
            CREATE SCHEMA "${SCHEMA}" AUTHORIZATION postgres
        `)

        const userName = 'node_user'
        const userExists = await dbClient.query(`
            SELECT 1 FROM pg_roles WHERE rolname='${userName}'
        `).then(value => value.rowCount === 1)

        if (!userExists) {
            console.log(`create ${userName}`)
            const password = uuid()
            await dbClient.query(`
                CREATE USER ${userName} WITH LOGIN NOCREATEDB NOSUPERUSER NOCREATEROLE NOINHERIT NOREPLICATION ENCRYPTED PASSWORD '${password}';
            `)
            fs.writeFileSync('./graph/.env', `user_name=${userName}\npassword=${password}\nport=${port}`)
            console.log('user credential ')
        }

        console.log(`grant execute permission to ${userName}`)
        dbClient.query(`
            GRANT EXECUTE ON ALL PROCEDURES IN SCHEMA "${SCHEMA}" TO "${userName}"
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
                id smallint NOT NULL,
                name varchar(20),
                PRIMARY KEY (id)
            );

            ALTER TABLE "${SCHEMA}"."member_type"
                OWNER to postgres;
        `)

        console.log('create member table')
        await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."member"
            (
                id smallint NOT NULL,
                english_given_name varchar(100),
                chinese_given_name varchar(20),
                english_surname varchar(50),
                chinese_surname varchar(10),
                email varchar(50),
                user_name varchar(50),
                password varchar(30),
                legacy_id varchar(20),
                gender character(1),
                member_type_id smallint,
                PRIMARY KEY (id),
                CONSTRAINT member_type_id_constraint FOREIGN KEY (member_type_id)
                    REFERENCES "${SCHEMA}".member_type (id) MATCH SIMPLE
            );

            ALTER TABLE "${SCHEMA}"."member"
                OWNER to postgres;
        `)

        console.log('create group table')
        await dbClient.query(`
            CREATE TABLE "${SCHEMA}"."group"
            (
                id smallint NOT NULL,
                group_name varchar(30),
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
                id smallint NOT NULL,
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
                id smallint NOT NULL,
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
                id smallint NOT NULL,
                record_id smallint NOT NULL,
                name text,
                value text,
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
                id smallint NOT NULL,
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
                id smallint NOT NULL,
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

        await dbClient.end()
    } catch (e) {
        console.log(e)
    }
}

async function main() {
    const user = await readPromise({ prompt: 'What is the database user name (default is "postgres")?' }) || 'postgres'
    const password = await readPromise({ prompt: 'Password:', silent: true, replace: '*' })

    await createDatabase(user, password)

    console.log('done.')
    process.exit(0)
}

main()