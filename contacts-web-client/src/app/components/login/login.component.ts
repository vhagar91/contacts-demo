import { ChangeDetectorRef, Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Credentials, User } from '../../types/types';
import { Router } from '@angular/router';
import { catchError } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  error: boolean = false;
  userForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', Validators.required)
  });

  constructor(private authService: AuthService, private router: Router, private cdr: ChangeDetectorRef) {

  }

  onSubmit() {
    const authUser = {
      username: this.userForm.value.username,
      password: this.userForm.value.password
    } as Credentials;
    this.authService.login(authUser)
      .subscribe({
        next: (response) => {
          this.router.navigate(['home']);
        },
        error: (e) => {
          this.error = true;
          this.cdr.detectChanges();
        },
        complete: () => console.info('Login complete')
      });
  }
}
