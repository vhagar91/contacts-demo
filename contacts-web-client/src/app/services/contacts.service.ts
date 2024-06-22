import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Contact, PaginationResult } from '../types/types';

@Injectable({
    providedIn: 'root'
})

export class ContactsService {

    private serverUrl = 'http://localhost:3000';

    constructor(private httpClient: HttpClient) { }

    public getContactList(page: number = 1) {
        return this.httpClient.get<PaginationResult<Contact>>(`${this.serverUrl}/api/v1/contacts?page=${page}`, { withCredentials: true });
    }

    public createContact(gitHubUser: string, freshDeskOrg: string) {
        const payload =
        {
            "github_username": gitHubUser,
            "fresdesk_subdomain": freshDeskOrg
        }
        return this.httpClient.post<Contact>(`${this.serverUrl}/api/v1/contacts`, payload, { withCredentials: true });
    }

}