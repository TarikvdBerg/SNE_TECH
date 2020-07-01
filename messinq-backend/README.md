# Setting up the MessinQ backend

The MessinQ backend is comprised of two components: the database (a local or remote MySQL instance)
and the NodeJS application.

The NodeJS application is responsible for the application logic. It connects to the MySQL
instance for the persistent storage of data received from clients, from user account details to
the message traffic.

Before running the application, the MySQL server should be set up. This can be done by importing the
SQL script found in the `database` folder found in the repository root. The connection to the database
can either be set in the environment or in a `.env` file. See the `env-readme.env` file for the
names of the respective database settings and credentials. This file can be duplicated as `.env`,
and be filled with settings and credentials. **This file has been excluded from Git commit inclusion
to prevent the leaking of sensitive information.**

After the database has been set up and the settings have been given in the `.env` file, make sure
all Node packages are installed by running:

```shell
npm install
```

If this operation has been run successfully, the application can be run using the following command:

```shell
npm start
```

When the application is running, a message along the lines of the following should appear:

```
App listening at http://localhost:3000
```

This location can be visited from a browser to access the application. If the database has been
initialized for the first time, a user account should be created by registering using the
web application. This will create a user account entry in the database that can be used for
accessing the application.
