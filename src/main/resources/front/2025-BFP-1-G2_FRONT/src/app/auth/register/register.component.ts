import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';
import {MatSnackBar} from "@angular/material/snack-bar";


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})


export class RegisterComponent {

  login = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]);
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
  confirmPassword = new FormControl('', [Validators.required]);
  name = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]);
  surname1 = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]);
  surname2 = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]);
  phoneNumber = new FormControl('', [Validators.required, Validators.pattern('^\\+?[0-9]{7,15}$')]);
  registerForm = new FormGroup({
    login: this.login,
    email: this.email,
    password: this.password,
    confirmPassword: this.confirmPassword,
    name: this.name,
    surname1: this.surname1,
    surname2: this.surname2,
    phoneNumber: this.phoneNumber
  });


  constructor(private authService: AuthService,
              private router: Router,
              private snackBar: MatSnackBar) {
    // this.applyTypingAnimation();
  }

  onSubmit(): void {
    if (this.email.value && this.password.value && this.login.value && this.name.value
      && this.surname1.value && this.surname2.value && this.phoneNumber.value) {
      this.authService.register({
        login: this.login.value,
        password: this.password.value,
        email: this.email.value,
        name: this.name.value,
        surname1: this.surname1.value,
        surname2: this.surname2.value,
        phoneNumber: this.phoneNumber.value
      }).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.snackBar.open('Regitro completado', 'Cerrar',{ duration: 3000 });

          this.authService.getUserName().subscribe({
            next: (username: string) => {
              console.log('Username retrieved:', username);
              this.router.navigate([`../company/${username}`]).then(() => {
                // Optionally, you can reset the form after successful registration
                this.onReset();
              });
            },
            error: (error: any) => {
              console.error('Error retrieving username', error);
            }
          });

        },
        error: (error) => {
          console.error('Registration failed', error);
          this.snackBar.open('Nombre o correo ya registrado', 'Cerrar');
        }
      });
    } else {
      console.error('Email or password is null');
    }
  }

  getNameErrorMessage(): string {
  if (this.name.hasError('required')) {
    return 'Debes introducir tu nombre';
  }
  if (this.name.hasError('minlength')) {
    return 'El nombre debe tener al menos 3 caracteres';
  }
  if (this.name.hasError('maxlength')) {
    return 'El nombre no puede tener más de 30 caracteres';
  }
  return '';
}

getSurname1ErrorMessage(): string {
  if (this.surname1.hasError('required')) {
    return 'Debes introducir el primer apellido';
  }
  if (this.surname1.hasError('minlength')) {
    return 'El primer apellido debe tener al menos 3 caracteres';
  }
  if (this.surname1.hasError('maxlength')) {
    return 'El primer apellido no puede tener más de 30 caracteres';
  }
  return '';
}

getSurname2ErrorMessage(): string {
  if (this.surname2.hasError('required')) {
    return 'Debes introducir el segundo apellido';
  }
  if (this.surname2.hasError('minlength')) {
    return 'El segundo apellido debe tener al menos 3 caracteres';
  }
  if (this.surname2.hasError('maxlength')) {
    return 'El segundo apellido no puede tener más de 30 caracteres';
  }
  return '';
}

getPhoneNumberErrorMessage(): string {
  if (this.phoneNumber.hasError('required')) {
    return 'Debes introducir un número de teléfono';
  }
  if (this.phoneNumber.hasError('pattern')) {
    return 'El número de teléfono no es válido';
  }
  return '';
}


  onReset() {
    this.email.reset();
    this.password.reset();
    this.confirmPassword.reset();
    this.login.reset();
    this.name.reset();
    this.surname1.reset();
    this.surname2.reset();
    this.phoneNumber.reset();
  }

  //
  // changeCard() {
  //   this.isAltTitle = !this.isAltTitle;
  //   this.isFieldShown = !this.isFieldShown;
  //   if (this.confirmPasswordField) {
  //     if (!this.isFieldShown) {
  //       this.confirmPasswordField.nativeElement.classList.add('hidden');
  //     } else {
  //       this.confirmPasswordField.nativeElement.classList.remove('hidden');
  //     }
  //   }
  // }

  getLoginErrorMessage(): string {
    if (this.login.hasError('required')) {
      return 'Debes introducir un nombre de usuario';
    }
    if (this.login.hasError('minlength')) {
      return 'El nombre de usuario debe tener al menos 3 caracteres';
    }
    if (this.login.hasError('maxlength')) {
      return 'El nombre de usuario no puede tener más de 50 caracteres';
    }
    return '';
  }

  getEmailErrorMessage(): string {
    if (this.email.hasError('required')) {
      return 'Debes introducir un valor';
    }
    if (this.email.hasError('email')) {
      return 'Correo no válido';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    if (this.confirmPassword && this.password.value !== this.confirmPassword.value) {
      return 'Las contraseñas no coinciden';
    }
    if (this.confirmPassword.hasError('required')) {
      return 'Debes confirmar tu contraseña';
    }
    return '';
  }

  getPasswordErrorMessage() {
    if (this.password.hasError('required')) {
      return 'Debes introducir una contraseña';
    }
    if (this.password.hasError('minlength')) {
      return 'La contraseña debe tener al menos 6 caracteres';
    }
    if (this.password.hasError('maxlength')) {
      return 'La contraseña no puede tener más de 20 caracteres';
    }
    return '';
  }


  formValid() {
    return this.login.valid && this.email.valid && this.password.valid && this.confirmPassword.valid && this.password.value === this.confirmPassword.value
      && this.name.valid && this.surname1.valid && this.surname2.valid && this.phoneNumber.valid;
  }

  // applyTypingAnimation() {
  //
  //   if (this.formTitle) {
  //     const title = this.isAltTitle ? 'Iniciar Sesión' : 'Registrarse';
  //     this.startTypingAnimation(this.formTitle.nativeElement, title);
  //   }
  // }
  //
  // startTypingAnimation(header: HTMLElement, text: string) {
  //   header.classList.add('animated');
  //   header.setAttribute('data-text', text);
  //   header.textContent = '';
  //   let index = 0;
  //   const typingSpeed = 70;
  //   const symbolSpeed = 60;
  //   const symbols = ['_', '|', '/', '\\', '*', '<', '>', '.', '{', '}', ';', '!', '@', '#', '$', '%', '^', '&'];
  //   const currentText = Array(text.length).fill('');
  //
  //   function typeLetter() {
  //     if (index < text.length) {
  //       let symbolIndex = 0;
  //       const symbolInterval = setInterval(() => {
  //         if (symbolIndex < symbolSpeed / typingSpeed) {
  //           const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  //           currentText[index] = randomSymbol;
  //           header.textContent = currentText.join('');
  //           symbolIndex++;
  //         } else {
  //           clearInterval(symbolInterval);
  //           currentText[index] = text[index];
  //           header.textContent = currentText.join('');
  //           index++;
  //           typeLetter();
  //         }
  //       }, symbolSpeed);
  //     }
  //   }
  //
  //   typeLetter();
  // }


}
