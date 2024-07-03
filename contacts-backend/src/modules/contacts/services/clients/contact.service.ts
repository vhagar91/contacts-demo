import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Contact, PaginatedContacts } from "../../entities/contact.entity";
import { PaginateOptions, paginate } from "../../pagination/paginator";
import { ListContacts, WhenRegisterFilter } from "../../data_transfer_objs/inputs/list.contacts.dto";
import { User } from "../../../users/entities/user.entity";
import { getManager } from 'typeorm';

@Injectable()
export class ContactsService {
    private readonly logger = new Logger(ContactsService.name);

    constructor(
        @InjectRepository(Contact)
        private readonly contactsRepo: Repository<Contact>
    ) { }

    private getContactsBaseQuery(): SelectQueryBuilder<Contact> {
        return this.contactsRepo.createQueryBuilder('c')
            .orderBy('c.registered', "DESC");
    }


    private getContacts(filter?: ListContacts): SelectQueryBuilder<Contact> {
        let query = this.getContactsBaseQuery();
        if (!filter) {
            return query;
        }
        if (filter.registered) {
            if (filter.registered == WhenRegisterFilter.Today) {
                query = query.andWhere(
                    `c.registered >= CURDATE() AND c.registered <= CURDATE() + INTERVAL 1 DAY`,
                );
            }

            if (filter.registered == WhenRegisterFilter.Yesterday) {
                query = query.andWhere(
                    `c.registered = CURDATE() - INTERVAL 1 DAY `,
                );
            }

            if (filter.registered == WhenRegisterFilter.ThisWeek) {
                query = query.andWhere('YEARWEEK(c.registered, 1) = YEARWEEK(CURDATE(), 1)');
            }
        }

        this.logger.debug(`Executing query ${query.getQuery()}`);
        return query;
    }

    public async getPaginatedContacts(filter: ListContacts, paginateOptions: PaginateOptions): Promise<PaginatedContacts> {
        return await paginate(this.getContacts(filter), paginateOptions)
    }

    public async registerContact(contact: Contact, createdBy: User): Promise<Contact> {
        const entityManager = this.contactsRepo.manager;
    
        const queryRunner = entityManager.connection.createQueryRunner();
    
        await queryRunner.connect();
        await queryRunner.startTransaction();
    
        try {
            this.logger.debug(`${new Date().toISOString()} Registering new Contact ${contact.name}`);
            const existingContact = await queryRunner.manager.findOne(Contact, { where: { gitHubId: contact.gitHubId } });
            contact.user = createdBy;
    
            if (existingContact) {
                this.logger.debug(`Contact exist on DB`);
                contact.id = existingContact.id;
                contact.registered = new Date();
            }
    
            const registeredContact = await queryRunner.manager.save(contact);
    
            await queryRunner.commitTransaction();
            this.logger.debug(`Contact Registered`);
    
            return registeredContact;
        } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}