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
    if (!this.formValid()) {
      this.snackBar.open('Por favor, completa todos los campos correctamente', 'Cerrar', {
        panelClass: ['error-snackbar'],
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    const credentials = {
      login: this.name.value!,
      password: this.password.value!
    };

    this.authService.login(credentials).subscribe({
      next: (token) => {
        console.log('Login successful, roles loaded. Processing post-login actions...');
        this.handlePostLoginActions();
      },
      error: (error) => {
        console.error('Login failed:', error);
        this.isLoading = false;
        this.handleLoginError(error);
      }
    });
  }

  private handlePostLoginActions(): void {
    const pendingOfferId = localStorage.getItem('pendingOfferId');
    
    const roles = this.authService.getRolesCached();
    console.log('Current roles cached:', roles);
    
    if (roles.length === 0) {
      console.log('No roles cached, ensuring roles are loaded...');
      this.authService.ensureRolesLoaded().subscribe({
        next: (loadedRoles) => {
          console.log('Roles loaded via fallback:', loadedRoles);
          this.processActionsWithRoles(pendingOfferId);
        },
        error: (error) => {
          console.error('Failed to load roles, redirecting to default:', error);
          this.redirectToHome();
        }
      });
    } else {
      this.processActionsWithRoles(pendingOfferId);
    }
  }

  private processActionsWithRoles(pendingOfferId: string | null): void {
    if (pendingOfferId) {
      this.handlePendingOfferApplication(Number(pendingOfferId));
    } else {
      this.redirectToHome();
    }
  }

  private handlePendingOfferApplication(offerId: number): void {
    localStorage.removeItem('pendingOfferId');
    
    const isCandidate = this.authService.isCandidateCached();
    console.log('Is candidate (cached):', isCandidate);
    
    if (isCandidate) {
      this.applyToOffer(offerId);
    } else {
      this.snackBar.open('Solo los candidatos pueden aplicar a ofertas', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      this.redirectToHome();
    }
  }

  private applyToOffer(offerId: number): void {
    this.offerService.applyToOffer(offerId).subscribe({
      next: (response) => {
        this.snackBar.open(response, 'Cerrar', { 
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.router.navigate(['/offers/portal']);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error applying to offer:', error);
        this.snackBar.open(
          error.error || 'Error al aplicar a la oferta', 
          'Cerrar', 
          {
            panelClass: ['error-snackbar'],
            duration: 4000
          }
        );
        this.redirectToHome();
      }
    });
  }

  private redirectToHome(): void {
    this.authService.redirectToUserHome();
    this.isLoading = false;
  }

  private handleLoginError(error: any): void {
    let errorMessage = 'Error de conexión. Inténtalo de nuevo.';
    
    if (error.status === 401 || error.status === 403) {
      errorMessage = 'Usuario o contraseña incorrectos';
    } else if (error.status === 0) {
      errorMessage = 'No se puede conectar con el servidor';
    } else if (error.error && typeof error.error === 'string') {
      errorMessage = error.error;
    }

    this.snackBar.open(errorMessage, 'Cerrar', {
      panelClass: ['error-snackbar'],
      duration: 4000
    });
  }

 

  getnameErrorMessage(): string {
    if (this.name.hasError('required')) {
      return 'El usuario es requerido';
    }
    if (this.name.hasError('name')) {
      return 'Formato de usuario no válido';
    }
    return '';
  }

  getPasswordErrorMessage(): string {
    if (this.password.hasError('required')) {
      return 'La contraseña es requerida';
    }
    if (this.password.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (this.password.hasError('maxlength')) {
      return 'La contraseña no puede tener más de 20 caracteres';
    }
    return '';
  }

  formValid(): boolean {
    return this.name.valid && 
           this.password.valid && 
           this.name.value !== null && 
           this.password.value !== null &&
           this.name.value.trim() !== '' &&
           this.password.value.trim() !== '';
  }

  clearForm(): void {
    this.name.setValue('');
    this.password.setValue('');
    this.name.markAsUntouched();
    this.password.markAsUntouched();
  }

  onEnterKey(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.formValid() && !this.isLoading) {
      this.onSubmit();
    }
  }

}
