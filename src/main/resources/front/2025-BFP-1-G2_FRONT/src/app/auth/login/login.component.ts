import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

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

  constructor(private authService: AuthService,
              private router: Router,
              private snackBar: MatSnackBar
  ) {}

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
          this.snackBar.open('Usuario o contraseña incorrectos', 'Cerrar', { duration: 600 });
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
