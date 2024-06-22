import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { GitHubService } from './services/clients/github.service';
import { FreshDeskService } from './services/clients/freshdesk.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from './entities/contact.entity';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './services/clients/contact.service';
import { ContactsBusinessService } from './services/contact.business.service';

@Module({
    imports: [HttpModule, TypeOrmModule.forFeature([Contact])],
    providers: [GitHubService, FreshDeskService, ContactsService, ContactsBusinessService],
    controllers: [ContactsController]
})
export class ContactsModule { }
