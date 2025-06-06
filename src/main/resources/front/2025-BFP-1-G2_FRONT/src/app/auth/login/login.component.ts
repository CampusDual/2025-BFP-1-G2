import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
  username!: string;
  loginForm = new FormGroup({
    email: this.email,
    password: this.password,
  });

  constructor(private authService: AuthService, private router: Router) {
  }

  onSubmit() {
    if (this.email.value !== null && this.password.value !== null) {
      this.authService.login({login: this.email.value, password: this.password.value}).subscribe({
        next: (response) => {
          console.log('Login successful', response);
          this.authService.getUserName().subscribe({
            next: (username: string) => {
              this.username = username;
              console.log('Username retrieved:', this.username);
              this.router.navigate([`../company/${this.username}`]).then(r => {
              });
            },
            error: (error: any) => {
              console.error('Error retrieving username', error);
            }
          });


        },
        error: (error) => {
          console.error('Login failed', error);
        }
      });
    } else {
      console.error('Email or password is null');
    }
  }

  onReset() {
    this.email.reset();
    this.password.reset();
  }

  getEmailErrorMessage()
    :
    string {
    if (this.email.hasError('required')) {
      return 'Debes introducir un valor';
    }
    if (this.email.hasError('email')) {
      return 'Correo no válido';
    }
    return '';
  }

  getPasswordErrorMessage() {
    if (this.password.hasError('required')) {
      return 'Debes introducir una contraseña';
    }
    return '';
  }


  formValid() {
    return this.email.valid && this.password.valid;
  }


}
