import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, SelectQueryBuilder } from "typeorm";
import { Contact, PaginatedContacts } from "../../entities/contact.entity";
import { PaginateOptions, paginate } from "../../pagination/paginator";
import { ListContacts, WhenRegisterFilter } from "../../data_transfer_objs/inputs/list.contacts.dto";
import { User } from "src/modules/users/entities/user.entity";


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
        this.logger.debug(`${new Date().toISOString()} Registering new Contact ${contact.name}`);
        const existingContact = await this.getContactsBaseQuery().andWhere(
            `c.gitHubId = ${contact.gitHubId}`
        ).getOne();
        contact.user = createdBy;
        if (existingContact) {
            contact.id = existingContact.id;
            contact.registered = new Date();
        }
        const registerd = await this.contactsRepo.save(contact);
        this.logger.debug(`Contact Registerd`);
        return registerd;
    }
}