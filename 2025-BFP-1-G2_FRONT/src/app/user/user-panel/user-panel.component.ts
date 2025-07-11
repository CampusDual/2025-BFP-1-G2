import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from "../../auth/services/auth.service";
import { ImageCompressionService } from "../../services/image-compression.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { TagService } from 'src/app/services/tag.service';
import { Tag } from 'src/app/admin/admin-dashboard/admin-dashboard.component';


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
  tagsControl = new FormControl<Tag[]>([], { nonNullable: true });
  curriculumUrl = new FormControl('');
  linkedinUrl = new FormControl('');
  githubUrl = new FormControl('');
  figmaUrl = new FormControl('');
  personalWebsiteUrl = new FormControl('');
  cvPdfBase64 = new FormControl('');
  logoImageBase64 = new FormControl('');
  isUploadingCV: boolean = false;
  isUploadingLogo: boolean = false;
  cvFileName: string = '';
  logoFileName: string = '';
  animatedName: string = '';
  fullName: string = '';
  private typingInterval: any;
  showCursor: boolean = true;
  isLoading: boolean = true;
  userRole: string = '';
  isEditMode: boolean = false;
  isSaving: boolean = false;
  userNameInput: string = '';
  isCandidate: boolean = false;
  avaliableTags: Tag[] = [];
  myTags: Tag[] = [];

  constructor(private authService: AuthService,
    private imageCompressionService: ImageCompressionService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private tagService: TagService) { }

  ngOnInit(): void {
    this.userNameInput = this.route.snapshot.paramMap.get('userName') || '';
    this.route.paramMap.subscribe(params => {
      const userName = params.get('userName');
      if (userName) {
        this.userNameInput = userName;
        this.authService.hasRole('ROLE_COMPANY').subscribe({
          next: (hasRole: boolean) => {
            if (hasRole) {
              this.loadSpecificCandidateData();
            } else {
              this.isCandidate = true;
              this.loadUserData();
            }
          },
          error: (error: any) => {
            console.error('Error checking user role', error);
            this.isLoading = false;
          }
        });
      }
    });
    this.tagService.getCandidateTags().subscribe({
      next: (tags) => {
        this.myTags = tags;
        console.log('Candidate tags loaded successfully', tags);
      },
      error: (error: any) => {
        console.error('Error fetching candidate tags', error);
      }
    });
    this.tagService.getAllTags().subscribe({
      next: (tags) => {
        this.avaliableTags = tags;
      },
      error: (error: any) => {
        console.error('Error fetching tags', error);
      }
    });
  }

  
  getTagsFormControl(): FormControl<Tag[]> {
    return this.tagsControl;
  }

  getSelectedTagsCount(): number {
    return this.tagsControl.value.length;
  }

  getSelectedTags(): Tag[] {
    return this.tagsControl.value;
  }

  isTagSelected(tag: Tag): boolean {
    return this.myTags.some(t => t.id === tag.id);
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
        this.curriculumUrl.setValue(user.curriculumUrl);
        this.linkedinUrl.setValue(user.linkedinUrl);
        this.githubUrl.setValue(user.githubUrl);
        this.figmaUrl.setValue(user.figmaUrl);
        this.personalWebsiteUrl.setValue(user.personalWebsiteUrl);
        this.cvPdfBase64.setValue(user.cvPdfBase64 || '');
        this.logoImageBase64.setValue(user.logoImageBase64 || '');
        const parts = [user.name, user.surname1, user.surname2].filter(Boolean);
        this.tagsControl.setValue(user.tags || []);
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

  loadSpecificCandidateData(): void {
    this.authService.getSpecificCandidateDetails(this.userNameInput).subscribe({
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
        this.curriculumUrl.setValue(user.curriculumUrl);
        this.linkedinUrl.setValue(user.linkedinUrl);
        this.githubUrl.setValue(user.githubUrl);
        this.figmaUrl.setValue(user.figmaUrl);
        this.personalWebsiteUrl.setValue(user.personalWebsiteUrl);
        this.cvPdfBase64.setValue(user.cvPdfBase64 || '');
        this.logoImageBase64.setValue(user.logoImageBase64 || '');
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
    this.logoImageBase64.setValue('');
  }

  getProfileImage(): string | null {
    if (this.logoImageBase64.value) {
      return this.logoImageBase64.value;
    }
    return null;
  }

  onLogoError(): void {
    console.warn('Error al cargar el logo, pero manteniendo el valor');
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
    this.curriculumUrl.markAsTouched();
    this.linkedinUrl.markAsTouched();
    this.githubUrl.markAsTouched();
    this.figmaUrl.markAsTouched();
    this.personalWebsiteUrl.markAsTouched();
    this.cvPdfBase64.markAsTouched();
    this.logoImageBase64.markAsTouched();

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
      curriculumUrl: this.curriculumUrl.value,
      linkedinUrl: this.linkedinUrl.value,
      githubUrl: this.githubUrl.value,
      figmaUrl: this.figmaUrl.value,
      personalWebsiteUrl: this.personalWebsiteUrl.value,
      cvPdfBase64: this.cvPdfBase64.value,
      logoImageBase64: this.logoImageBase64.value
    };

    this.authService.updateCandidateDetails(updatedData).subscribe({
      next: (response) => {
        console.log('Datos actualizados exitosamente', response);
        this.isEditMode = false;
        this.isSaving = false;
        const parts = [this.userName.value, this.userSurname1.value, this.userSurname2.value].filter(Boolean);
        this.fullName = parts.join(' ');
        this.snackbar.open('Datos actualizados correctamente', 'Cerrar', { duration: 3000 });
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
      this.curriculumUrl.invalid || this.linkedinUrl.invalid ||
      this.githubUrl.invalid || this.figmaUrl.invalid || this.personalWebsiteUrl.invalid ||
      this.cvPdfBase64.invalid || this.logoImageBase64.invalid;
  }


  async onCVFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;


    const validation = this.imageCompressionService.validatePDFFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      event.target.value = '';
      return;
    }

    this.isUploadingCV = true;
    try {
      const pdfBase64 = await this.imageCompressionService.convertPDFToBase64(file);
      this.cvPdfBase64.setValue(pdfBase64);
      this.cvFileName = file.name;
      console.log('CV PDF cargado exitosamente');
    } catch (error) {
      console.error('Error al procesar el PDF:', error);
      alert('Error al procesar el archivo PDF');
    } finally {
      this.isUploadingCV = false;
      event.target.value = '';
    }
  }

  async onLogoFileSelected(event: any): Promise<void> {
    const file = event.target.files[0];
    if (!file) return;

    const validation = this.imageCompressionService.validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      event.target.value = '';
      return;
    }

    this.isUploadingLogo = true;
    try {
      const compressedBase64 = await this.imageCompressionService.compressLogo(file);
      this.logoImageBase64.setValue(compressedBase64);
      this.logoFileName = file.name;
      console.log('Logo comprimido y cargado exitosamente');
      this.saveChanges();
    } catch (error) {
      console.error('Error al comprimir el logo:', error);
      alert('Error al procesar la imagen del logo');
    } finally {
      this.isUploadingLogo = false;
      event.target.value = '';
    }
  }

  removeCVImage(): void {
    this.cvPdfBase64.setValue('');
    this.cvFileName = '';
  }

  removeLogoImage(): void {
    this.logoImageBase64.setValue('');
    this.logoFileName = '';
  }

  downloadCVImage(): void {
    if (this.cvPdfBase64.value) {
      const link = document.createElement('a');
      link.href = this.cvPdfBase64.value;
      link.download = this.cvFileName || 'cv.pdf';
      link.click();
    }
  }

  openFileSelector(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
      if (!this.isEditMode) {
        this.saveChanges();
      }
    }
  }

  openCVFileSelector(): void {
    const cvFileInput = document.querySelector('#cvFileInput') as HTMLInputElement;
    if (cvFileInput) {
      cvFileInput.click();
    }
  }

  ngOnDestroy(): void {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
  }
}
