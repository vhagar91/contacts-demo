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
  errorMessage: string = "";

  contanctForm = new FormGroup({
    gitHubUser: new FormControl('', Validators.required),
    freshDeskOrg: new FormControl('', Validators.required),
  });

  @ViewChild('pagination') paginator!: ClrDatagridPagination;

  constructor(private constactsService: ContactsService) {

  }



  refresh(state: ClrDatagridStateInterface) {
    this.loading = true;
    // We convert the filters from an array to a map,
    // because that's what our backend-calling service is expecting
    this.constactsService.getContactList(state.page?.current)
      .subscribe(
        (response) => {
          console.log(`Contacts Fetcher ${response.data.length}`);
          this.users = response.data;
          this.paginator.totalItems = response.total;
          this.loading = false;
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

  formClear(){
    this.contanctForm.reset();
    this.errorMessage = '';
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
    this.errorMessage = e.error.message;
  }

  handleContactCreationComplete() {
    this.loading = false;
    this.contanctForm.reset();
    this.contanctForm.enable();
    this.errorMessage = "";
    console.log('completed contact creation');
  }

}
