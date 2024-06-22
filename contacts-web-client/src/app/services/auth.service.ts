import { EventEmitter, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Credentials, User } from '../types/types';
import { map } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private serverUrl = 'http://localhost:3000';
    private loggedUser!: string;
    private eventEmitter = new EventEmitter();

    constructor(private httpClient: HttpClient) { }

    public login(user: Credentials) {
        return this.httpClient.post<any>(`${this.serverUrl}/api/v1/users/login`, user, { withCredentials: true })
            .pipe(
                map(result => {
                    console.log("Service Login Result: ", result);
                    this.loggedUser = result.user;
                    this.eventEmitter.emit(this.loggedUser);
                    return result;
                })
            )
    }

    public logout() {
        return this.httpClient.get(`${this.serverUrl}/api/v1/users/logout`, { withCredentials: true })
            .pipe(
                map(result => {
                    console.log("Service Logout Result: ", result);
                    this.loggedUser = '';
                    this.eventEmitter.emit(this.loggedUser);
                })
            )
    }


    public isLoggedIn() {
        return this.httpClient.get<{ user: string, msg: string }>(`${this.serverUrl}/api/v1/users/validate`, { withCredentials: true })
            .pipe(
                map(result => {
                    console.log("Session: ", result);
                    this.loggedUser = '';
                    this.eventEmitter.emit(this.loggedUser);
                    return result;
                })
            )
    }

    public getEventEmitter() {
        return this.eventEmitter;
    }

    public registerUser(userData:User){
        return this.httpClient.post<User>(`${this.serverUrl}/api/v1/users/register`, userData, { withCredentials: true })
            .pipe(
                map(result => {
                    console.log("Service Register Result: ", result);
                    return result;
                })
            )
    }
}