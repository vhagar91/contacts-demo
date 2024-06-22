import { MigrationInterface, QueryRunner, Table } from "typeorm"
import * as bcrypt from "bcrypt";

export class CreateAdminMigration1515769694450 implements MigrationInterface {
    async up(queryRunner: QueryRunner): Promise<void> {
        const adminPassword = await bcrypt.hash("administrator", 10)
        await queryRunner.createTable(
            new Table({
                name: "user",
                columns: [
                    {
                        name: "id",
                        type: "varchar",
                        isPrimary: true,
                    },
                    {
                        name: "username",
                        type: "varchar",
                    },
                    {
                        name: "password",
                        type: "varchar",
                    },
                    {
                        name: "firstName",
                        type: "varchar",
                    },
                    {
                        name: "lastName",
                        type: "varchar",
                    },
                ],
            }),
            true
        )
        await queryRunner.query(`INSERT INTO user (
            id,
            username,
            password,
            email,
            firstName,
            lastName
        )
        VALUES (
            UUID(),
            'admin',
            '${adminPassword}',
            'admin@contacts.com',
            'Admin',
            'Contacts'
        );
        `)
    }
    async down(queryRunner: QueryRunner): Promise<void> { }
}