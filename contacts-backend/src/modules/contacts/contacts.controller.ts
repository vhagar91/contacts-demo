import { Body, ClassSerializerInterceptor, Controller, Get, Logger, Post, Query, SerializeOptions, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ListContacts, WhenRegisterFilter } from './data_transfer_objs/inputs/list.contacts.dto';
import { CreateContactDto } from './data_transfer_objs/inputs/create.contact.dto';
import { Contact } from './entities/contact.entity';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';
import { ContactsBusinessService } from './services/contact.business.service';

@Controller({
    path: "contacts",
    version: '1',
})
@ApiTags('Contacts')
@SerializeOptions({ strategy: 'excludeAll' })
export class ContactsController {
    private readonly logger = new Logger(ContactsController.name);

    constructor(
        private readonly contactsBUService: ContactsBusinessService,
    ) { }

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    @ApiQuery({
        name: "registered",
        enum: WhenRegisterFilter,
        required: false
    })
    @ApiQuery({
        name: "page",
        type: () => Number,
        required: false
    })
    @UseGuards(AuthenticatedGuard)
    public async findAll(@Query() filter: ListContacts) {
        return await this.contactsBUService.fetchAllContactsPaginated(filter);
    }

    @ApiOperation({ summary: 'Fetch user info from github -> create fresshdesk contact -> store on DB' })
    @Post()
    @UseInterceptors(ClassSerializerInterceptor)
    @UseGuards(AuthenticatedGuard)
    public async create(@Body() payload: CreateContactDto, @CurrentUser() user: User): Promise<Contact> {
       return await this.contactsBUService.importOrUpdateContactInFreshdesk(payload.github_username, payload.fresdesk_subdomain, user);
    }

}
