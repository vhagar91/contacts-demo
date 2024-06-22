# 

# Welcome to DemoContacts

## Getting started:
### Prerequisites
Podman or Docker installed

### run app  with:
first navigate to the base folder of the project 
#### Windows Os/Linux/Mac docker:
```bash
docker compose up
```
#### Windows Os/Linux/Mac Podman:
```bash
podman compose up
```

[!IMPORTANT]

this will start both the server and the frontend. wait until  start

[!NOTE]

1- by default a migration is run in the new database to create a default user name:admin pass:administrator this user can be use to log in to the main application via UI or swagger

### Tech Stack

[UI Theming - Clarity ](https://clarity.design/)

[Backend - NestJs (Express) ](https://docs.nestjs.com/)

[Database - MySql]

### Interacting with the app

#### Database
Mysql is running on port localhost:3306 can be access via web on localhost port 8080 default credentials are root:example and database server host is mysql_db

#### Backend
swagger api docs are available on http://localhost:3000/api-docs
If need it a new user can be register using swagger try out function

#### frontend
Fron end will be available on http://localhost:80/
