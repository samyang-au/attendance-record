# Intro
This program is created for True Jesus Church - Brisbane Church for keeping attendance record. The main driver for
creating this program is to keep detailed record of the names of people who attended church service for contact
tracing purpose and to be COVID-SAFE complient.

# Getting Started

## Recommended IDE
Visual Studio Code https://code.visualstudio.com

## Install Node
Install node version 12.18.4 or above from https://nodejs.org/en/download/

## Install yarn
Follow the instructions on https://classic.yarnpkg.com/en/docs/install/

## Install Global Dependencies
In a command prompt, run <Code>yarn global add tslint typescript</code>

## Install Database
Install PostgreSQL from here https://www.postgresql.org/download/

Choose your own password<br>
Port: 5432 <br>
Locale: en_AU.UTF8

Launch stack builder is not required.

## Install all node modules
In a command prompt, change to the directory you copied the code to, run <cdoe>yarn install:all</code>

## Setup Database Table

In a command prompt, change to the directory you copied the code to, run <Code>yarn createDatabase</code> to create
the database. It will prompt you for the user name and password. Typically you'll use "postgres" as user name
and the password you choose in the "Install Database" step. However, you can also use any login that have super
user privilege. If you already have a database created, it'll also prompt you if you want to delete and re-create
the database. Alternatively, if you don't want to type in user name and password all the time, you can also add
a <code>.env</code> file in the database folder for user_name and password, and the script will simply use those
credentials. Note: only do this in test environment or you risk expose your super user password.

During the very first run of <code>yarn createDatabase</code>, it will also create a <code>node_user</code>, and
place a <code>.env</code> file in the graph directory. This will be the user express use to login to the database.
The <code>.env</code> should not be checked in to git repository for security reason, so be careful not to delete
this file. If you lost this file, you'll need to manually recreate the <code>node_user</code> in the database and
manually create the content of <code>.env</code> file.

By default, <code>node_user</code> can only execute stored procedures for security reason, and you should not
elevate its privilege.

NOTE: if you are connected to the database (e.g. via pgAdmin) then the script will not be able to drop the database.
Make sure you disconnect all the connection first before running the script.