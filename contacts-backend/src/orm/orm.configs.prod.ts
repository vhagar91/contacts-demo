import { registerAs } from "@nestjs/config";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Contact } from "src/modules/contacts/entities/contact.entity";
import { User } from "src/modules/users/entities/user.entity";
import { CreateAdminMigration1515769694450 } from "./migration/create.admin.migration";


export default registerAs('orm.config', (): TypeOrmModuleOptions => ({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [User, Contact],
    synchronize: true,
    migrationsRun: true,
    migrations: [CreateAdminMigration1515769694450],
    dropSchema: Boolean(parseInt(process.env.DB_DROP_SCHEMA))
}))