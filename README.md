# Fileshare

This project is a simplistic file-sharing web service, built with the
[Spring Framework](https://spring.io/). The application was initially created
as a course project for the subject "Internet programming" at my high school.

## Table of contents

* [Short description](#short-description)
* [Getting started](#getting-started)
    - [TL;DR](#tldr)
    - [Prerequisites](#prerequisites)
    - [Getting the project](#getting-the-project)
    - [Running a MySQL server](#running-a-mysql-server)
    - [A word on Gmail's SMTP service](#a-word-on-gmails-smtp-service)
    - [Installation](#installation)
    - [Running on a local server](#running-on-a-local-server)
        * [Example](#example)
* [Built with](#built-with)
* [License](#license)

## Short description

In order to use this web service, users must first create their own account
by registering. After registration a verification email is sent to the registered
user's email address. The newly-registered user is allowed to sign in only after
they have verified their account.

This file-sharing web app allows its users to create a complex hierarchy of
folders and files. After registration each user automatically has a 'root'
folder created and associated with them. This main folder cannot be destroyed
or renamed. The user can then create additional nested folders and upload 
arbitrary files which are stored in the web service's database. That same user 
may then rename, move, and delete any created folders or uploaded files.

Each user also has the ability to create unique links which are used to 
anonymously download files or zipped folders. These links may afterwards be 
shared to other people, even those that are not users of the file-sharing web
service. Users also have the ability to destroy generated download links, if
they decide to stop sharing any of their files.

## Getting started

This section contains instructions on how to download, install, and run this 
web service on your local linux-enabled machine.

### TL;DR

```bash
$ git clone https://github.com/Pejo-306/fileshare.git
$ cd fileshare/
```

In one shell window:

```bash
$ docker-compose up
```

In a second shell window:

```bash
$ mvn install
$ java -jar -Dport=[PORT] -Ddbhost=[DBHOST] -Ddbuser=[DBUSER] -Dpassword=[PASSWORD] -Dschema=[SCHEMA] -Dgmail_username=[GMAIL_USERNAME] -Dgmail_password=[GMAIL_PASSWORD] target/fileshare-0.0.1-SNAPSHOT.jar
```

See the meanings of the parameters [here](#running-on-a-local-server).

### Prerequisites

You must have Apache Maven and Java 8 (or higher) installed on your machine to
run this project. This project was built with the following versions:

* Java version "1.8.0_201"
* Apache Maven 3.6.0

### Getting the project

To get a copy of this web app, you need to clone this repository like so:

```bash
$ git clone https://github.com/Pejo-306/fileshare.git
$ cd fileshare/
```

### Running a MySQL server

This Spring project requires a working MySQL server to persist its data. If you
already have a running MySQL server on your machine than you may skip this section.

Alternatively, this project comes with a ['docker-compose.yml'](docker-compose.yml) 
file which creates a container with MySQL and phpMyAdmin. In order to use this
file, you need to have [Docker](https://www.docker.com/) and 
[Docker Compose](https://github.com/docker/compose) installed on your
machine. At the time of writing the following versions are used:

* Docker version 19.03.8
* docker-compose version 1.21.2

After you have [Docker](https://www.docker.com/) and 
[Docker Compose](https://github.com/docker/compose) installed, you have to run
the following command*, which creates the wanted docker container:

```bash
$ docker-compose up
```

***Note**: if you already have a MySQL server or other service running on port **3306**,
then Docker Compose will fail to start its own MySQL server. You must first disable
said service to release port **3306**. Another option is to edit the
['docker-compose.yml'](docker-compose.yml) file to run the MySQL server on another
port.

A MySQL server will then be running on [localhost:3306](localhost:3306). You may also
access phpMyAdmin via a browser by visiting http://localhost:8183.

### A word on Gmail's SMTP service

This project uses Gmail's SMTP service to send verification emails. You need to have
a valid Gmail account which has "Less secure app access" option on. You can read more
[here](https://support.google.com/accounts/answer/6010255?hl=en). 

Alternatively, if you wish to use another service to send verification emails, then
you have to edit the 'Mail properties' in
['application.properties'](src/main/resources/application.properties). Using other
third-party mail services is beyond the scope of this document.

### Installation

The project is installed via Maven by running the following command*:

```bash
$ mvn install
```

***Note**: during installation Maven also test-runs the Spring project. These
tests require an active and valid connection to a MySQL server via JDBC. Maven
attempts to establish a connection by utilizing the default values, specified
in the ['application.properties'](src/main/resources/application.properties)
file, i.e. it attempts to connect to [localhost:3306](localhost:3306) via the **root** user
with the password **root** and to create the project's schema in the
**default_schema** database. If any of the listed conditions are not fulfilled,
the installation fails. You have two options in this case:

* Alter the default parameter values in ['application.properties'](src/main/resources/application.properties);
* Skip tests during installation (which doesn't require a running MySQL server):

```bash
$ mvn install -DskipTests
```

### Running on a local server

After the project has been installed and a working MySQL server has been deployed,
you may run the project via the following command:

```bash
$ java -jar -Dport=[PORT] -Ddbhost=[DBHOST] -Ddbuser=[DBUSER] -Dpassword=[PASSWORD] -Dschema=[SCHEMA] -Dgmail_username=[GMAIL_USERNAME] -Dgmail_password=[GMAIL_PASSWORD] target/fileshare-0.0.1-SNAPSHOT.jar
```

Where the environmental parameters have the following meanings:
* PORT: the port on which the web service is launched;
* DBHOST: the MySQL database host;
* DBUSER: the MySQL database user;
* PASSWORD: the MySQL database password for user 'dbuser';
* SCHEMA: the MySQL database schema;
* GMAIL_USERNAME: your Gmail account address;
* GMAIL_PASSWORD: your Gmail account password.

Afterwards, the web service will be available on [localhost:PORT](http://localhost:PORT).

#### Example

```bash
$ java -jar -Dport=8000 -Ddbhost=localhost:3306 -Ddbuser=root -Dpassword=root -Dschema=fileshare_schema -Dgmail_username=example@gmail.com -Dgmail_password=password target/fileshare-0.0.1-SNAPSHOT.jar
```

This command will launch the web service on http://locahost:8000. The app will
establish a connection with a MySQL server, located at [localhost:3306](localhost:3306),
via the **root** user with the password **root** and use the **fileshare_schema**
database to persist its data. Verification emails will be sent out by the
**example@gmail.com** address. The web service will use the **password** password
to authenticate itself to Gmail and access the **example@gmail.com** account.

## Built with

* [Spring Framework](https://spring.io/)
* [Docker Compose](https://github.com/docker/compose)

## License

This project is distributed under the [MIT license](LICENSE).
