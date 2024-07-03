import { HttpException, Injectable, Logger } from "@nestjs/common";
import { ContactsService } from "./clients/contact.service";
import { GitHubService } from "./clients/github.service";
import { FreshDeskService } from "./clients/freshdesk.service";
import { FreshDeskContactPayload } from "../data_transfer_objs/consume/freshdesk.contact.dto";
import { Contact } from "../entities/contact.entity";
import { User } from "../../users/entities/user.entity";
import { ListContacts } from "../data_transfer_objs/inputs/list.contacts.dto";
import { GitHubUser } from "../data_transfer_objs/consume/github.user.dto";

@Injectable()
export class ContactsBusinessService {
    private readonly logger = new Logger(ContactsBusinessService.name);
    constructor(
        private readonly contactsService: ContactsService,
        private readonly gitHubService: GitHubService,
        private readonly freshDeskService: FreshDeskService
    ) { }



    public async fetchAllContactsPaginated(filter: ListContacts) {
        const contacts =
            await this.contactsService.getPaginatedContacts(
                filter,
                {
                    total: true,
                    currentPage: filter.page || 1,
                    limit: 5,
                },
            );
        return contacts;
    }

   /**
   * Imports or updates a contact in Freshdesk based on the given GitHub username.
   *
   * This method fetches user data from GitHub, validates the Freshdesk organization,
   * creates or updates the contact in Freshdesk, and registers the contact locally.
   *
   * @param githubUsername - The GitHub username of the user to import or update.
   * @param freshdeskSubdomain - The subdomain of the Freshdesk organization.
   * @param requestedBy - The user who initiated the request.
   * @returns The registered contact.
   *
   * TODO: Add more granular error handling for specific failure cases.
   * TODO: Case where freshdesk contact exist in soft delete state needs to be handle
   * TODO: Add more detailed logging for each step to improve traceability.
   */
    public async importOrUpdateContactInFreshdesk(githubUsername: string, freshdeskSubdomain: string, requestedBy: User) {
        try {
            const githubUser = await this.gitHubService.getUserDataByName(githubUsername);
            await this.freshDeskService.validateFreshdeskOrg(freshdeskSubdomain);
            this.logger.debug(`User found on GitHub with name: ${githubUser.name}`);

            const freshDeskContact = this.createFreshDeskContactPayload(githubUser);

            if (githubUser.company) {
                await this.handleCompanyInfo(githubUser.company, freshdeskSubdomain, freshDeskContact);
            }

            if (githubUser.avatar_url) {
                await this.handleAvatar(githubUser.avatar_url, freshDeskContact);
            }

            const newContact = await this.updateOrCreateContact(freshdeskSubdomain, freshDeskContact);
            this.logger.debug(`Freshdesk contact created/updated`);

            const contact = this.createContactEntity(githubUser, newContact.id.toString());
            return await this.contactsService.registerContact(contact, requestedBy);
        } catch (error) {
            this.logger.error(`Failed to import or update contact in Freshdesk: ${error.message}`);
            throw new HttpException('Failed to import or update contact in Freshdesk', error.status || 500);
        }
    }


    private createFreshDeskContactPayload(githubUser: GitHubUser): FreshDeskContactPayload {
        return {
            unique_external_id: githubUser.id?.toString(),
            description: githubUser.bio || 'Contact created from GitHub data',
            name: githubUser.name || githubUser.login,
            email: githubUser.email,
            address: githubUser.location,
            twitter_id: githubUser.twitter_username,
            company_id: null
        };
    }

    private async handleCompanyInfo(company: string, freshdeskSubdomain: string, freshDeskContact: FreshDeskContactPayload) {
        try {
            this.logger.debug(`User has company information, creating/updating company in Freshdesk`);
            freshDeskContact.company_id = await this.getOrCreateCompanyId(freshdeskSubdomain, company);
            this.logger.debug(`Company created/updated in Freshdesk`);
        } catch (error) {
            this.logger.error(`Failed to handle company info: ${error.message}`);
            throw error;
        }
    }

    private async handleAvatar(avatarUrl: string, freshDeskContact: FreshDeskContactPayload) {
        try {
            this.logger.debug(`Setting avatar from GitHub: ${avatarUrl}`);
            const response = await fetch(avatarUrl);

            if (!response.ok) {
                throw new HttpException('Failed to fetch avatar image', 500);
            }

            const blob = await response.blob();
            if (blob.size >= 5 * 1024 * 1024) {
                this.logger.warn('File size exceeds Freshdesk requirements, skipping avatar replication');
            } else {
                freshDeskContact.avatar = blob;
            }
        } catch (error) {
            this.logger.error(`Failed to handle avatar: ${error.message}`);
            throw new HttpException(`Failed to handle avatar: ${error.message}`, 500);
        }
    }

    private async updateOrCreateContact(subdomain: string, newContact: FreshDeskContactPayload) {
        let contacts = await this.freshDeskService.searchContact(subdomain, newContact.unique_external_id, false);
        //Searching again to check if contact with same id is on soft deleted state
        contacts = contacts.length > 0 ? contacts : await this.freshDeskService.searchContact(subdomain, newContact.unique_external_id, true);
        const bodyFormData = new FormData();
        Object.keys(newContact).forEach(key => {
            if (newContact[key]) {
                if (key === 'avatar') bodyFormData.append("avatar", newContact[key], 'avatar.png');
                else bodyFormData.append(key, newContact[key]);
            }
        })

        if (contacts.length > 0) {
            this.logger.log(`Updating existing contact Contact on Freshdesk ${newContact.name}`)
            //TODO when updating if contact is in soft deleted contact user should be deleted or restore before updating
            if (contacts[0].active) {
                return await this.freshDeskService.updateContact(subdomain, contacts[0].id, bodyFormData);
            }
            return contacts[0];
        } else {
            this.logger.log(`Creating new Contact on Freshdesk ${newContact.name}`)
            return await this.freshDeskService.createContact(subdomain, bodyFormData);
        }
    }

    private async getOrCreateCompanyId(subdomain: string, companyName: string): Promise<number | null> {
        const data = await this.freshDeskService.seachCompanyByName(subdomain, companyName);

        if (data.companies.length > 0) {
            return data.companies[0].id;
        }
        const newCompany = await this.freshDeskService.createCompany(subdomain, {
            name: companyName,
        });
        return newCompany.id;
    }

    private createContactEntity(githubUser: GitHubUser, freshdeskId: string): Contact {
        const contact = new Contact();
        contact.name = githubUser.name || githubUser.login;
        contact.email = githubUser.email;
        contact.gitHubId = githubUser.id;
        contact.githubUser = githubUser.login;
        contact.freshdeskId = freshdeskId;
        contact.company = githubUser.company;
        return contact;
    }

}