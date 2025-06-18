import { Component } from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import { AuthService } from '../services/auth.service';
import {Router} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import {MatCardModule} from "@angular/material/card";
import {MatInputModule} from "@angular/material/input";
import {MatProgressBarModule} from "@angular/material/progress-bar";
import {MatButtonModule} from "@angular/material/button";
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-company-login',
  templateUrl: './company-login.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatProgressBarModule,
    MatButtonModule,
    CommonModule
  ],
  styleUrls: ['./company-login.component.css']
})

export class CompanyLoginComponent {
  login = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
  isLoading = false;

  loginForm = new FormGroup({
    login: this.login,
    password: this.password,
  });

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  onSubmit() {
    this.isLoading = true;
    if (this.login.value !== null && this.password.value !== null) {
      this.authService.login({ login: this.login.value, password: this.password.value }).subscribe({
        next: () => {

          this.router.navigate([`../company/myoffers`]).then(() => {
            this.isLoading = false;
          });

        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Usuario o contraseña incorrectos', 'Cerrar', { duration: 3000 });
        }
      });
    } else {
      this.isLoading = false;
    }
  }

  onReset() {
    this.login.reset();
    this.password.reset();
  }

  getLoginErrorMessage(): string {
    if (this.login.hasError('required')) {
      return 'Debes introducir un valor';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password.hasError('required')) {
      return 'Debes introducir una contraseña';
    }
    return '';
  }

  formValid() {
    return this.login.valid && this.password.valid;
  }
}
