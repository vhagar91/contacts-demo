import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrl: './nav-bar.component.css'
})
export class NavBarComponent {
  loggedUser: string = '';
  constructor(private readonly authService: AuthService, private readonly router: Router) { }

  ngOnInit() {
    this.authService.isLoggedIn()
      .subscribe(
        (authResponse) => {
          if (authResponse.user) {
            this.loggedUser = authResponse.user;
          }
        }
      );

    this.authService.getEventEmitter()
      .subscribe(
        (loggedUser) => { this.loggedUser = loggedUser }
      );
  }

  logOut() {
    this.authService.logout()
      .subscribe(
        () => { this.router.navigate(['login']) }
      );
  }

}
