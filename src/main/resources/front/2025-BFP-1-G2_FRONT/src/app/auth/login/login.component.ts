import {Component, ElementRef, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {Router} from "@angular/router";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  name = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
  isLoading = false;

  username!: string;
  loginForm = new FormGroup({
    name: this.name,
    password: this.password,
  });

  constructor(private authService: AuthService, private router: Router) {
  }

  onSubmit() {
    this.isLoading = true;
    if (this.name.value !== null && this.password.value !== null) {
      this.authService.login({login: this.name.value, password: this.password.value}).subscribe({
        next: (response) => {
            this.router.navigate([`../company/${this.name.value}`]).then(() => {
            this.isLoading = false;
          });
        },
        error: (error) => {
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  onReset() {
    this.name.reset();
    this.password.reset();
  }

  getnameErrorMessage()
    :
    string {
    if (this.name.hasError('required')) {
      return 'Debes introducir un valor';
    }
    if (this.name.hasError('name')) {
      return 'Login no válido';
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
    return this.name.valid && this.password.valid;
  }


}
