import { Component, ViewChild } from '@angular/core';
import { ContactsService } from '../../services/contacts.service';
import { Contact } from '../../types/types';
import { ClrDatagridStateInterface, ClrDatagridPagination } from "@clr/angular";
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { upsertObject } from '../../utils/upsertArray';

@Component({
  selector: 'app-contacts-listing',
  templateUrl: './contacts-listing.component.html',
  styleUrl: './contacts-listing.component.css'
})

export class ContactsListingComponent {
  users: Contact[] = [];
  modalState = false;
  loading = true;
  errorMessageContactImport: string = "";

  contanctForm = new FormGroup({
    gitHubUser: new FormControl('', Validators.required),
    freshDeskOrg: new FormControl('', Validators.required),
  });

  @ViewChild('pagination') paginator!: ClrDatagridPagination;

  constructor(private constactsService: ContactsService) {

  }



  refresh(state: ClrDatagridStateInterface) {
    this.loading = true;
    this.constactsService.getContactList(state.page?.current)
      .subscribe(
        {
          next: (contacts) => {
            console.log(`Contacts Fetcher ${contacts.data.length}`);
            this.users = contacts.data;
            this.paginator.totalItems = contacts.total;
          },
          error: (error) => {
            //TODO Handle Error on interface for end users
            this.loading = false;
          },
          complete: () => {
            this.loading = false;
          }
        }
      );
  }

  createContact() {
    this.loading = true;
    this.contanctForm.disable();

    const { gitHubUser, freshDeskOrg } = this.contanctForm.value;
    if (gitHubUser && freshDeskOrg) {
      this.constactsService.createContact(gitHubUser, freshDeskOrg).subscribe({
        next: (newContact) => this.handleContactCreationSuccess(newContact),
        error: (error) => this.handleContactCreationError(error),
        complete: () => this.handleContactCreationComplete()
      });
    }
  }

  formClear() {
    this.contanctForm.reset();
    this.errorMessageContactImport = '';
    this.modalState = false;
  }

  handleContactCreationSuccess(newContact: Contact) {
    this.users = upsertObject(this.users, newContact);
    this.paginator.totalItems++;
    this.modalState = false;
  }

  handleContactCreationError(e: any) {
    this.loading = false;
    this.contanctForm.enable();
    this.errorMessageContactImport = e.error.message;
  }

  handleContactCreationComplete() {
    this.loading = false;
    this.contanctForm.reset();
    this.contanctForm.enable();
    this.errorMessageContactImport = "";
    console.log('completed contact creation');
  }

}
