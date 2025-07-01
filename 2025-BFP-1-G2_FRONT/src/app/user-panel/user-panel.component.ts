import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {AuthService, User} from "../auth/services/auth.service";

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.css']
})
export class UserPanelComponent implements OnInit, OnDestroy {

  userName = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]);
  userSurname1 = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]);
  userSurname2 = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]);
  userEmail = new FormControl('', [Validators.required, Validators.email]);
  login = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]);
  phoneNumber = new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern('^[0-9]+$')]);

  location = new FormControl('', [Validators.maxLength(100)]);
  professionalTitle = new FormControl('', [Validators.maxLength(100)]);
  yearsOfExperience = new FormControl('', [Validators.min(0), Validators.max(50)]);
  educationLevel = new FormControl('', [Validators.maxLength(100)]);
  languages = new FormControl('', [Validators.maxLength(200)]);
  employmentStatus = new FormControl('', [Validators.maxLength(50)]);
  profilePictureUrl = new FormControl('');

  curriculumUrl = new FormControl('');
  linkedinUrl = new FormControl('');
  githubUrl = new FormControl('');
  figmaUrl = new FormControl('');
  personalWebsiteUrl = new FormControl('');

  animatedName: string = '';
  fullName: string = '';
  private typingInterval: any;
  showCursor: boolean = true;

  isLoading: boolean = true;
  userRole: string = '';
  isEditMode: boolean = false;
  isSaving: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.authService.getCandidateDetails().subscribe({
      next: (user: any) => {
        this.userName.setValue(user.name);
        this.userSurname1.setValue(user.surname1);
        this.userSurname2.setValue(user.surname2);
        this.userEmail.setValue(user.email);
        this.login.setValue(user.login || user.username);
        this.phoneNumber.setValue(user.phoneNumber);

        this.location.setValue(user.location);
        this.professionalTitle.setValue(user.professionalTitle);
        this.yearsOfExperience.setValue(user.yearsOfExperience);
        this.educationLevel.setValue(user.educationLevel);
        this.languages.setValue(user.languages);
        this.employmentStatus.setValue(user.employmentStatus);
        this.profilePictureUrl.setValue(user.profilePictureUrl);

        this.curriculumUrl.setValue(user.curriculumUrl);
        this.linkedinUrl.setValue(user.linkedinUrl);
        this.githubUrl.setValue(user.githubUrl);
        this.figmaUrl.setValue(user.figmaUrl);
        this.personalWebsiteUrl.setValue(user.personalWebsiteUrl);

        const parts = [user.name, user.surname1, user.surname2].filter(Boolean);
        this.fullName = parts.join(' ');
        this.isLoading = false;
        this.startTypingAnimation();
      },
      error: (error: any) => {
        console.error('Error fetching user data', error);
        this.isLoading = false;
      }
    });
  }

  startTypingAnimation() {
    this.animatedName = '';
    let i = 0;
    this.showCursor = true;
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    this.typingInterval = setInterval(() => {
      if (i < this.fullName.length) {
        this.animatedName += this.fullName[i];
        i++;
      } else {
        clearInterval(this.typingInterval);
        setTimeout(() => {
          this.showCursor = false;
        }, 1000);
      }
    }, 70);
  }

  openLink(url: string | null): void {
    if (url) {
      window.open(url, '_blank');
    }
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
  }

  onImageError(): void {
    this.profilePictureUrl.setValue('');
  }

  saveChanges(): void {
    if (this.isSaving) return;
    
    this.userName.markAsTouched();
    this.userSurname1.markAsTouched();
    this.userSurname2.markAsTouched();
    this.userEmail.markAsTouched();
    this.login.markAsTouched();
    this.phoneNumber.markAsTouched();
    this.location.markAsTouched();
    this.professionalTitle.markAsTouched();
    this.yearsOfExperience.markAsTouched();
    this.educationLevel.markAsTouched();
    this.languages.markAsTouched();
    this.employmentStatus.markAsTouched();
    this.profilePictureUrl.markAsTouched();
    this.curriculumUrl.markAsTouched();
    this.linkedinUrl.markAsTouched();
    this.githubUrl.markAsTouched();
    this.figmaUrl.markAsTouched();
    this.personalWebsiteUrl.markAsTouched();
    
    // Validar campos requeridos
    if (this.hasFormErrors()) {
      console.error('Hay errores en el formulario');
      return;
    }
    
    this.isSaving = true;
    const updatedData = {
      name: this.userName.value,
      surname1: this.userSurname1.value,
      surname2: this.userSurname2.value,
      email: this.userEmail.value,
      login: this.login.value,
      phoneNumber: this.phoneNumber.value,
      location: this.location.value,
      professionalTitle: this.professionalTitle.value,
      yearsOfExperience: this.yearsOfExperience.value,
      educationLevel: this.educationLevel.value,
      languages: this.languages.value,
      employmentStatus: this.employmentStatus.value,
      profilePictureUrl: this.profilePictureUrl.value,
      curriculumUrl: this.curriculumUrl.value,
      linkedinUrl: this.linkedinUrl.value,
      githubUrl: this.githubUrl.value,
      figmaUrl: this.figmaUrl.value,
      personalWebsiteUrl: this.personalWebsiteUrl.value
    };

    this.authService.updateCandidateDetails(updatedData).subscribe({
      next: (response) => {
        console.log('Datos actualizados exitosamente', response);
        this.isEditMode = false;
        this.isSaving = false;
        const parts = [this.userName.value, this.userSurname1.value, this.userSurname2.value].filter(Boolean);
        this.fullName = parts.join(' ');
        this.startTypingAnimation();
      },
      error: (error) => {
        console.error('Error al actualizar los datos', error);
        this.isSaving = false;
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.loadUserData();
  }

  hasFormErrors(): boolean {
    return this.userName.invalid || this.userSurname1.invalid || this.userSurname2.invalid || 
           this.userEmail.invalid || this.login.invalid || this.phoneNumber.invalid ||
           this.location.invalid || this.professionalTitle.invalid || this.yearsOfExperience.invalid ||
           this.educationLevel.invalid || this.languages.invalid || this.employmentStatus.invalid ||
           this.profilePictureUrl.invalid || this.curriculumUrl.invalid || this.linkedinUrl.invalid ||
           this.githubUrl.invalid || this.figmaUrl.invalid || this.personalWebsiteUrl.invalid;
  }

  ngOnDestroy(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }
}
