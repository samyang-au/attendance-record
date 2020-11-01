NOTE: If you're viewing this in Visual Studio Code (VSCode), you can right click on the file and select <code>Open Preview</code> for better viewing.

# Intro
This program is created for True Jesus Church - Brisbane Church for keeping attendance record. The main driver for creating this program is to keep detailed record of the names of people who attended church service for contact tracing purpose and to be COVID-SAFE complient.

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

In a command prompt, change to the directory you copied the code to, run <Code>yarn createDatabase</code> to create the database. It will prompt you for the user name and password. Typically you'll use "postgres" as user name and the password you choose in the "Install Database" step. However, you can also use any login that have super user privilege. If you already have a database created, it'll also prompt you if you want to delete and re-create the database. Alternatively, if you don't want to type in user name and password all the time, you can also add a <code>.env</code> file in the database folder for user_name and password, and the script will simply use those credentials. Note: only do this in test environment or you risk expose your super user password.

During the very first run of <code>yarn createDatabase</code>, it will also create a <code>node_user</code>, and place a <code>.env</code> file in the graph directory. This will be the user express use to login to the database. The <code>.env</code> should not be checked in to git repository for security reason, so be careful not to delete this file. If you lost this file, you'll need to manually recreate the <code>node_user</code> in the database and manually create the content of <code>.env</code> file. Alternatively, if you're using a test database, you can simply delete the node_user from pgAdmin, and run yarn createDatabase again. However, this will override your <code>.env</code> file and you'll lose the changes you made.

By default, <code>node_user</code> can only execute stored procedures for security reason, and you should not elevate its privilege.

NOTE: if you are connected to the database (e.g. via pgAdmin) then the script will not be able to drop the database. Make sure you disconnect all the connection first before running the script.

## Database Development Tips
* While developing stored procedures (called functions in PostgreSQL), you can run <code>yarn resetStoredProc</code> to recreate all the stored procedures
* You can create <code>.env</code> file in the <code>/database</code> directory to avoid typing username/password
> user_name=[user name of database superuser, usually postgres]<br>
> password=[password of superuser]<br>
> port=5432<br>
> env=[prod or dev]<br>

## Configure SSL
The following code is taken from the website below. A Test certificate is checked into the repository for convenience, however, this certificate should NOT be used for production.

https://www.freecodecamp.org/news/how-to-get-https-working-on-your-local-development-environment-in-5-minutes-7af615770eec/

For production, use the commands below to generate a prod certificate:

<code>
openssl genrsa -des3 -out rootCA.key 2048<br><br>
openssl req -x509 -new -nodes -key rootCA.key -sha256 -days 1024 -out rootCA.pem<br><br>
openssl req -new -sha256 -nodes -out server.csr -newkey rsa:2048 -keyout server.key -config <( cat server.csr.cnf )<br><br>
openssl x509 -req -in server.csr -CA rootCA.pem -CAkey rootCA.key -CAcreateserial -out server.crt -days 500 -sha256 -extfile v3.ext<br><br>
</code>

# Graph
Before you start, you should aready have a <code>.env</code> file in the <code>/graph</code> directory created by the <code>yarn createDatabase</code> step. In addition to those values, you'll need to add a few extra values, so the complete <code>.env</code> file should match:
> user_name=node_user<br>
> password=[value should already be added by yarn createDatabase step]<br>
> port=5432<br>
> secret=[mandatory, type in some random long string, used to sign jwt tokens]<br>
> timeout=[non-mandatory, timout in minutes, default is 15]<br>
> superuser_name=[mandatory if you want to run test]<br>
> superuser_password=[mandatory if you want to run test]<br>

In a command prompt, change into <code>/graph</code> directory. Run <code>yarn</code> to install all the dependencies. Run <code>yarn start</code> to start the graph server. When doing development, run <code>yarn start:dev</code> to start graph in watch mode, and <code>yarn test</code> to run all the unit tests.

Once you started the graph, wait until you see the message <code>listening to port 433</code>. Then go to https://localhost:433/graphql and trust the <code>Do not trust unless unless in development</code> certificate. You should see a graph playground where you can start querying the graph.

The first query you should execute is
<code>
> {<br>
> &nbsp;&nbsp;login(userName: "admin", password: "admin") {<br>
> &nbsp;&nbsp;&nbsp;&nbsp;id<br>
> &nbsp;&nbsp;&nbsp;&nbsp;token<br>
> &nbsp;&nbsp;&nbsp;&nbsp;passwordResetRequired<br>
> &nbsp;&nbsp;}<br>
> }<br>
</code>
NOTE: if you alredy changed the admin password you'll need to use the correct password.

If the userName and password is valid, you should get a token back. This token will be valid for the duration of <code>timeout</code> value you specified in the <code>.env</code> file. If you increase the <code>timeout</code> value at this point, you'll need to restart the graph for it to use the updated value. For calling any of the secured queries, you'll need to add this token to the <code>HTTP HEADERS</code> tab located at the bottom left of the page. The format is:
<code>
> {<br>
> &nbsp;&nbsp;"authorization": "[token value pasted here]"<br>
> }<br>
</code>