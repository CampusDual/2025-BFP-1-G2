import {Component, ElementRef, ViewChild} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AuthService} from '../services/auth.service';
import {Router} from '@angular/router';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})


export class RegisterComponent {
  // @ViewChild('registerForm') formContainer!: ElementRef;
  // @ViewChild('formTitle', {static: false}) formTitle!: ElementRef<HTMLHeadingElement>;
  // @ViewChild('confirmPasswordField', { static: false }) confirmPasswordField!: ElementRef<HTMLDivElement>;  private isAltTitle = false;
  // private isFieldShown = true;
  //
  name = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]);
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]);
  confirmPassword = new FormControl('', [Validators.required]);
  registerForm = new FormGroup({
    name: this.name,
    email: this.email,
    password: this.password,
    confirmPassword: this.confirmPassword
  });


  constructor(private authService: AuthService, private router: Router) {
    // this.applyTypingAnimation();
  }

  onSubmit(): void {
    if (this.email.value && this.password.value && this.name.value) {
      this.authService.register({
        login: this.email.value,
        password: this.password.value,
        name: this.name.value
      }).subscribe({
        next: (response) => {
          console.log('Registration successful', response);
          this.router.navigate([`../company/${this.name.value}`]).then(r => {
          });

        },
        error: (error) => {
          console.error('Registration failed', error);
        }
      });
    } else {
      console.error('Email or password is null');
    }
  }


  onReset() {
    this.email.reset();
    this.password.reset();
    this.confirmPassword.reset();
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

  getNameErrorMessage(): string {
    if (this.name.hasError('required')) {
      return 'Debes introducir un nombre';
    }
    if (this.name.hasError('minlength')) {
      return 'El nombre debe tener al menos 3 caracteres';
    }
    if (this.name.hasError('maxlength')) {
      return 'El nombre no puede tener más de 50 caracteres';
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
    return this.name.valid && this.email.valid && this.password.valid && this.confirmPassword.valid && this.password.value === this.confirmPassword.value;
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
