import { Expose } from "class-transformer";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { PaginationResult } from "../pagination/paginator";
import { User } from "../../users/entities/user.entity";

@Entity()
export class Contact {

    constructor(partial?: Partial<Contact>) {
        Object.assign(this, partial);
    }

    @PrimaryGeneratedColumn('uuid')
    @Expose()
    id: string;

    @Column()
    @Expose()
    name: string;

    @Column()
    @Expose()
    githubUser: string;

    @Column({ unique: true })
    @Expose()
    gitHubId: number;

    @Column({ nullable: true })
    @Expose()
    email: string;

    @Column({ nullable: true })
    @Expose()
    freshdeskId: string;

    @Column({ nullable: true })
    @Expose()
    company: string;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
    })
    @Expose()
    registered: Date;

    @ManyToOne(() => User, (user) => user.contacts)
    @JoinColumn({ name: 'creatorId' })
    user: User;

    @Column({ nullable: true })
    @Expose()
    creatorId: string;
}
export type PaginatedContacts = PaginationResult<Contact>;