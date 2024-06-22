import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactsListingComponent } from './contacts-listing.component';

describe('ContactsListingComponent', () => {
  let component: ContactsListingComponent;
  let fixture: ComponentFixture<ContactsListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContactsListingComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContactsListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
