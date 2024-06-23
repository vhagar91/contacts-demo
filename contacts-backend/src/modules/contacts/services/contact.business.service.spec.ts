import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { ContactsService } from './clients/contact.service';
import { GitHubService } from './clients/github.service';
import { FreshDeskService } from './clients/freshdesk.service';
import { ListContacts } from '../data_transfer_objs/inputs/list.contacts.dto';
import { GitHubUser } from '../data_transfer_objs/consume/github.user.dto';
import { ContactsBusinessService } from './contact.business.service';
import { Contact } from '../entities/contact.entity';
import { FreshDeskContactResponse } from '../data_transfer_objs/consume/freshdesk.contact.dto';
import { User } from '../../users/entities/user.entity';

describe('ContactsBusinessService', () => {
    let service: ContactsBusinessService;
    let contactsService: ContactsService;
    let gitHubService: GitHubService;
    let freshDeskService: FreshDeskService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ContactsBusinessService,
                {
                    provide: ContactsService,
                    useValue: {
                        getPaginatedContacts: jest.fn(),
                        registerContact: jest.fn()
                    }
                },
                {
                    provide: GitHubService,
                    useValue: {
                        getUserDataByName: jest.fn()
                    }
                },
                {
                    provide: FreshDeskService,
                    useValue: {
                        validateFreshdeskOrg: jest.fn(),
                        searchContact: jest.fn(),
                        updateContact: jest.fn(),
                        createContact: jest.fn(),
                        seachCompanyByName: jest.fn(),
                        createCompany: jest.fn()
                    }
                },
                Logger
            ]
        }).compile();

        service = module.get<ContactsBusinessService>(ContactsBusinessService);
        contactsService = module.get<ContactsService>(ContactsService);
        gitHubService = module.get<GitHubService>(GitHubService);
        freshDeskService = module.get<FreshDeskService>(FreshDeskService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('fetchAllContactsPaginated', () => {
        it('should fetch all contacts paginated', async () => {
            const filter: ListContacts = { page: 1 };
            const result = { data: [], total: 0, first: 0, last: 0, limit: 5 };

            jest.spyOn(contactsService, 'getPaginatedContacts').mockResolvedValue(result);

            expect(await service.fetchAllContactsPaginated(filter)).toBe(result);
            expect(contactsService.getPaginatedContacts).toHaveBeenCalledWith(filter, {
                total: true,
                currentPage: filter.page || 1,
                limit: 5
            });
        });
    });

    describe('importOrUpdateContactInFreshdeskNoAvatarCompanyExist', () => {
        it('should import or update a contact in Freshdesk', async () => {
            const githubUsername = 'username';
            const freshdeskSubdomain = 'subdomain';
            const requestedBy: User = new User();
            const githubUser: GitHubUser = {
                id: 1,
                name: 'name',
                login: 'login',
                email: 'email@example.com',
                location: 'location',
                bio: 'bio',
                twitter_username: 'twitter',
                company: 'company',
                avatar_url: null
            };
            const freshDeskContact = new FreshDeskContactResponse({
                id: 1,
                active: true,
                company_id: 1,
                name: 'name'
            });
            const registeredContact = new Contact();
            const company = {
                id: 1,
                name: githubUser.company
            }
            jest.spyOn(gitHubService, 'getUserDataByName').mockResolvedValue(githubUser);
            jest.spyOn(freshDeskService, 'validateFreshdeskOrg').mockResolvedValue(undefined);
            jest.spyOn(freshDeskService, 'searchContact').mockResolvedValue([]);
            jest.spyOn(freshDeskService, 'seachCompanyByName').mockResolvedValue({ companies: [company] });
            jest.spyOn(freshDeskService, 'createContact').mockResolvedValue(freshDeskContact);
            jest.spyOn(contactsService, 'registerContact').mockResolvedValue(registeredContact);

            const result = await service.importOrUpdateContactInFreshdesk(githubUsername, freshdeskSubdomain, requestedBy);

            expect(result).toBe(registeredContact);
            expect(gitHubService.getUserDataByName).toHaveBeenCalledWith(githubUsername);
            expect(freshDeskService.validateFreshdeskOrg).toHaveBeenCalledWith(freshdeskSubdomain);
            expect(freshDeskService.searchContact).toHaveBeenCalledWith(freshdeskSubdomain, githubUser.id.toString(), false);
            expect(freshDeskService.createContact).toHaveBeenCalled();
            expect(contactsService.registerContact).toHaveBeenCalledWith(expect.any(Contact), requestedBy);
        }); 
    });
});
