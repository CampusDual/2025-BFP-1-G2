import {Component, OnInit, OnDestroy} from '@angular/core';
import {AuthService, User} from "../auth/services/auth.service";

@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.css']
})
export class UserPanelComponent implements OnInit, OnDestroy {

  userName: string | null = null;
  userSurname1: string | null = null;
  userSurname2: string | null = null;
  userEmail: string | null = null;
  login: string | null = null;
  phoneNumber: string | null = null;

  location: string | null = null;
  professionalTitle: string | null = null;
  yearsOfExperience: number | null = null;
  educationLevel: string | null = null;
  languages: string | null = null;
  employmentStatus: string | null = null;
  profilePictureUrl: string | null = null;

  curriculumUrl: string | null = null;
  linkedinUrl: string | null = null;
  githubUrl: string | null = null;
  figmaUrl: string | null = null;
  personalWebsiteUrl: string | null = null;

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
        this.userName = user.name;
        this.userSurname1 = user.surname1;
        this.userSurname2 = user.surname2;
        this.userEmail = user.email;
        this.login = user.login;
        this.phoneNumber = user.phoneNumber;

        this.location = user.location;
        this.professionalTitle = user.professionalTitle;
        this.yearsOfExperience = user.yearsOfExperience;
        this.educationLevel = user.educationLevel;
        this.languages = user.languages;
        this.employmentStatus = user.employmentStatus;
        this.profilePictureUrl = user.profilePictureUrl;

        this.curriculumUrl = user.curriculumUrl;
        this.linkedinUrl = user.linkedinUrl;
        this.githubUrl = user.githubUrl;
        this.figmaUrl = user.figmaUrl;
        this.personalWebsiteUrl = user.personalWebsiteUrl;

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
    // Si hay error al cargar la imagen, usar null para mostrar el placeholder
    this.profilePictureUrl = null;
  }

  saveChanges(): void {
    if (this.isSaving) return;
    
    this.isSaving = true;
    const updatedData = {
      name: this.userName,
      surname1: this.userSurname1,
      surname2: this.userSurname2,
      email: this.userEmail,
      login: this.login,
      phoneNumber: this.phoneNumber,
      location: this.location,
      professionalTitle: this.professionalTitle,
      yearsOfExperience: this.yearsOfExperience,
      educationLevel: this.educationLevel,
      languages: this.languages,
      employmentStatus: this.employmentStatus,
      profilePictureUrl: this.profilePictureUrl,
      curriculumUrl: this.curriculumUrl,
      linkedinUrl: this.linkedinUrl,
      githubUrl: this.githubUrl,
      figmaUrl: this.figmaUrl,
      personalWebsiteUrl: this.personalWebsiteUrl
    };

    this.authService.updateCandidateDetails(updatedData).subscribe({
      next: (response) => {
        console.log('Datos actualizados exitosamente', response);
        this.isEditMode = false;
        this.isSaving = false;
        // Actualizar el nombre completo y la animación
        const parts = [this.userName, this.userSurname1, this.userSurname2].filter(Boolean);
        this.fullName = parts.join(' ');
        this.startTypingAnimation();
      },
      error: (error) => {
        console.error('Error al actualizar los datos', error);
        this.isSaving = false;
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    // Recargar los datos originales
    this.loadUserData();
  }

  ngOnDestroy(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }
}
