import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../services/auth.service';
import { Router } from "@angular/router";
import { MatSnackBar } from "@angular/material/snack-bar";
import { OfferService } from "../../services/offer.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  name = new FormControl('', [Validators.required]);
  password = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
  isLoading = false;

  loginForm = new FormGroup({
    name: this.name,
    password: this.password,
  });

  constructor(private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private offerService: OfferService
  ) {
  }

  onSubmit() {
    this.isLoading = true;
    if (this.name.value !== null && this.password.value !== null) {
      this.authService.login({ login: this.name.value, password: this.password.value }).subscribe({
        next: () => {
          const pendingOfferId = localStorage.getItem('pendingOfferId');
          if (pendingOfferId) {
            localStorage.removeItem('pendingOfferId');
            if (this.authService.isCandidate()) {
              this.offerService.applyToOffer(Number(pendingOfferId)).subscribe({
                next: (applyResponse) => {
                  this.snackBar.open(applyResponse, 'Cerrar', { duration: 3000 });
                  this.router.navigate([`../offers/portal`]);
                },
                error: (error) => {
                  this.snackBar.open(error.error, 'Cerrar', {
                    panelClass: ['error-snackbar']
                  });
                  this.router.navigate([`../user`]);
                }
              });
            }
            else this.snackBar.open("Solo los candidatos pueden aplicar a ofertas", 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
          } else {
            if (this.authService.isCandidate()) {
              this.router.navigate([`../offers/portal`]);
            }else if (this.authService.isCompany()) {
              this.router.navigate([`../company/myoffers`]);
            }
          }
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.snackBar.open('Usuario o contraseña incorrectos', 'Cerrar', {
            panelClass: ['error-snackbar']
          });
        }
      });
    } else {
      this.isLoading = false;
    }
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
