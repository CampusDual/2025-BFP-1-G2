import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from "../../auth/services/auth.service";
import { ImageCompressionService } from "../../services/image-compression.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { TagService } from 'src/app/services/tag.service';
import { Tag } from 'src/app/models/tag.model';
import { CandidateService } from 'src/app/services/candidate.service';
import { filter, Subscription } from 'rxjs';
import { DetailedCardService } from 'src/app/services/detailed-card.service';
import { Location } from '@angular/common';


@Component({
  selector: 'app-user-panel',
  templateUrl: './user-panel.component.html',
  styleUrls: ['./user-panel.component.css']
})
export class UserPanelComponent implements OnInit, OnDestroy {

  private routerSub: Subscription;
  showBackButton = false;

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
  experiences: any[] = [];
  educations: any[] = [];

  newExperience: any = {
    jobTitle: '',
    companyName: '',
    startDate: '',
    endDate: '',
    responsibilities: ''
  };

  newEducation: any = {
    degree: '',
    institution: '',
    startDate: '',
    endDate: '',
    description: ''
  };

  showAddExperienceForm: boolean = false;
  showAddEducationForm: boolean = false;

  avaliableTags: Tag[] = [];
  myTags: Tag[] = [];
  selectedTags: Tag[] = [];
  tagSearchControl = new FormControl('');
  filteredTags!: Observable<Tag[]>;
  separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(
    private authService: AuthService,
    private candidateService: CandidateService,
    private imageCompressionService: ImageCompressionService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private tagService: TagService,
    private detailedCardService: DetailedCardService,
    private router: Router,
    private routeLocation: Location) {
    this.routerSub = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateBackButtonState();
      });
  }

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
    this.tagService.getCandidateTagsByUsername(this.userNameInput).subscribe({
      next: (tags) => {
        this.myTags = tags;
        this.selectedTags = [...tags];
        this.tagsControl.setValue(tags);
        console.log('Candidate tags loaded successfully', tags);
      },
      error: (error: any) => {
        console.error('Error fetching candidate tags', error);
      }
    });
    this.tagService.getAllTags().subscribe({
      next: (tags) => {
        this.avaliableTags = tags;
        this.filteredTags = this.tagSearchControl.valueChanges.pipe(
          startWith(''),
          map((value: string | null) => this._filterTags(value))
        );
      },
      error: (error: any) => {
        console.error('Error fetching tags', error);
      }
    });
  }
  private _filterTags(value: string | null): Tag[] {
    const filterValue = (value || '').toLowerCase();
    return this.avaliableTags.filter(tag => tag.name.toLowerCase().includes(filterValue));
  }
  ngOnDestroy() {
    if (this.typingInterval) {
      clearInterval(this.typingInterval);
    }
    if (this.routerSub) {
      this.routerSub.unsubscribe();
    }
  }

  private updateBackButtonState() {
    this.showBackButton = this.detailedCardService.hasState();
  }
  goBack() {
    this.routeLocation.back();

    setTimeout(() => {
      this.detailedCardService.requestRestore();
    }, 100);
  }


  getTagsFormControl(): FormControl<Tag[]> {
    return this.tagsControl;
  }
  private _filterTags(value: string | null): Tag[] {
    const filterValue = (value || '').toLowerCase();
    return this.availableTags.filter(tag => tag.name.toLowerCase().includes(filterValue));
  }


  getSelectedTagsCount(): number {
    return this.myTags.length;
  }

  getSelectedTags(): Tag[] {
    return this.myTags;
  }

  isTagSelected(tag: Tag): boolean {
    return this.myTags.some(t => t.id === tag.id);
  }

  toggleTagSelection(tag: Tag): void {
    const index = this.myTags.findIndex(t => t.id === tag.id);
    if (index > -1) {
      // Deselect
      this.myTags.splice(index, 1);
    } else {
      if (this.myTags.length < 10) {
        this.myTags.push(tag);
      }
    }
  }


  addTagFromInput(event: any): void {
    const input = event.input;
    const value = event.value;
    if ((value || '').trim()) {
      const foundTag = this.availableTags.find(tag => tag.name.toLowerCase() === value.trim().toLowerCase());
      if (foundTag && this.selectedTags.length < 10 && !this.selectedTags.some(t => t.id === foundTag.id)) {
        this.selectedTags.push(foundTag);
        this.tagSearchControl.setValue('');
      }
    }
    if (input) {
      input.value = '';
    }
  }

  onTagSelected(event: any): void {
    const tag: Tag = event.option.value;
    if (tag && this.selectedTags.length < 10 && !this.selectedTags.some(t => t.id === tag.id)) {
      this.selectedTags.push(tag);
      this.tagSearchControl.setValue('');
    }
  }

  removeTag(tag: Tag): void {
    this.selectedTags = this.selectedTags.filter(t => t.id !== tag.id);
  }

  onSearchFocus(): void {
    this.filteredTags = this.tagSearchControl.valueChanges.pipe(
      startWith(this.tagSearchControl.value || ''),
      map((value: string | null) => this._filterTags(value))
    );
  }







  loadUserData(): void {
    this.candidateService.getCandidateDetails().subscribe({
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
        this.experiences = (user.experiences || [])
          .map((exp: any) => ({
            id: exp.id || exp.experienceId,
            jobTitle: exp.jobTitle || '',
            companyName: exp.companyName || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            responsibilities: exp.responsibilities || ''
          }))
          .sort((a: any, b: any) => {
            const dateA = new Date(a.endDate || a.startDate).getTime();
            const dateB = new Date(b.endDate || b.startDate).getTime();
            return dateA - dateB;
          });
        this.educations = (user.educations || [])
          .map((edu: any) => ({
            id: edu.id || edu.educationId,
            degree: edu.degree || '',
            institution: edu.institution || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            description: edu.description || ''
          }))
          .sort((a: any, b: any) => {
            const dateA = new Date(a.endDate || a.startDate).getTime();
            const dateB = new Date(b.endDate || b.startDate).getTime();
            return dateB - dateA;
          });
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
    this.candidateService.getSpecificCandidateDetails(this.userNameInput).subscribe({
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
        this.experiences = (user.experiences || [])
          .map((exp: any) => ({
            id: exp.id || exp.experienceId,
            jobTitle: exp.jobTitle || '',
            companyName: exp.companyName || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            responsibilities: exp.responsibilities || ''
          }))
          .sort((a: any, b: any) => {
            const dateA = new Date(a.endDate || a.startDate).getTime();
            const dateB = new Date(b.endDate || b.startDate).getTime();
            return dateB - dateA;
          });
        this.educations = (user.educations || [])
          .map((edu: any) => ({
            id: edu.id || edu.educationId,
            degree: edu.degree || '',
            institution: edu.institution || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || '',
            description: edu.description || ''
          }))
          .sort((a: any, b: any) => {
            const dateA = new Date(a.endDate || a.startDate).getTime();
            const dateB = new Date(b.endDate || b.startDate).getTime();
            return dateB - dateA;
          });
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

    // Ya no se agrega la experiencia pendiente ni se mapean las experiencias
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

    // Log para depuración
    console.log('Datos que se envían al backend:', updatedData);

    // Actualizar datos del usuario
    this.candidateService.updateCandidateDetails(updatedData).subscribe({
      next: () => {
        // Actualizar tags del candidato
        const tagIds = this.myTags.map(tag => tag.id).filter((id): id is number => typeof id === 'number');
        this.tagService.updateCandidateTags(tagIds).subscribe({
          next: () => {
            this.myTags = [...this.selectedTags];
            this.isEditMode = false;
            this.isSaving = false;
            const parts = [this.userName.value, this.userSurname1.value, this.userSurname2.value].filter(Boolean);
            this.fullName = parts.join(' ');
            this.snackbar.open('Datos actualizados correctamente', 'Cerrar', { duration: 3000 });
          },
          error: (error) => {
            console.error('Error al actualizar los tags', error);
            this.isSaving = false;
            this.snackbar.open('Error al actualizar los tags', 'Cerrar', { duration: 3000 });
          }
        });
      },
      error: (error) => {
        console.error('Error al actualizar los datos', error);
        this.isSaving = false;
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    // Recargar solo los datos básicos del usuario, sin experiencia ni educación
    this.candidateService.getCandidateDetails().subscribe({
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



  openAddExperienceForm(): void {
    this.showAddExperienceForm = true;
  }

  closeAddExperienceForm(): void {
    this.showAddExperienceForm = false;
    this.newExperience = { jobTitle: '', companyName: '', startDate: '', endDate: '', responsibilities: '' };
  }

  addExperience(): void {
    if (!this.newExperience.jobTitle || !this.newExperience.companyName) {
      this.snackbar.open('Puesto y empresa son obligatorios', 'Cerrar', { duration: 2000 });
      return;
    }
    console.log('JSON enviado al backend (nueva experiencia):', this.newExperience);
    this.authService.createExperience(this.newExperience).subscribe({
      next: (createdExp: any) => {
        console.log('Respuesta del backend (experiencia creada):', createdExp);
        const normalizedExp = {
          ...createdExp,
          id: createdExp.id || createdExp.experienceId
        };
        this.experiences.push(normalizedExp);
        this.snackbar.open('Experiencia añadida correctamente', 'Cerrar', { duration: 2000 });
        this.closeAddExperienceForm();

      },
      error: () => {
        this.snackbar.open('Error al añadir la experiencia', 'Cerrar', { duration: 2500 });
      }
    });
  }

  openAddEducationForm(): void {
    this.showAddEducationForm = true;
  }

  closeAddEducationForm(): void {
    this.showAddEducationForm = false;
    this.newEducation = { degree: '', institution: '', startDate: '', endDate: '', description: '' };
  }

  addEducation(): void {
    if (!this.newEducation.degree || !this.newEducation.institution) {
      this.snackbar.open('Título y centro son obligatorios', 'Cerrar', { duration: 2000 });
      return;
    }
    console.log('JSON enviado al backend (nueva educación):', this.newEducation);
    this.authService.createEducation(this.newEducation).subscribe({
      next: (createdEdu: any) => {
        console.log('Respuesta del backend (educación creada):', createdEdu);
        const normalizedEdu = {
          ...createdEdu,
          id: createdEdu.id || createdEdu.educationId
        };
        this.educations.push(normalizedEdu);
        this.snackbar.open('Formación añadida correctamente', 'Cerrar', { duration: 2000 });
        this.closeAddEducationForm();

      },
      error: () => {
        this.snackbar.open('Error al añadir la formación', 'Cerrar', { duration: 2500 });
      }
    });
  }

  currentExperienceIndex = 0;

  prevExperience() {
    if (this.currentExperienceIndex > 0) {
      this.currentExperienceIndex--;
    }
  }

  nextExperience() {
    if (this.currentExperienceIndex < this.experiences.length - 1) {
      this.currentExperienceIndex++;
    }
  }

  goToExperience(index: number) {
    this.currentExperienceIndex = index;
  }

  removeExperience(index: number): void {
    const exp = this.experiences[index];
    if (!exp) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar esta experiencia?')) {
      const experienceId = exp.id || exp.experienceId;
      if (!experienceId) {
        this.snackbar.open('No se puede eliminar: falta el id de la experiencia', 'Cerrar', { duration: 2500 });
        return;
      }
      this.authService.deleteExperience(experienceId).subscribe({
        next: () => {
          this.experiences.splice(index, 1);
          if (this.currentExperienceIndex >= this.experiences.length) {
            this.currentExperienceIndex = Math.max(0, this.experiences.length - 1);
          }
          this.snackbar.open('Experiencia eliminada correctamente', 'Cerrar', { duration: 2000 });
        },
        error: () => {
          this.snackbar.open('Error al eliminar la experiencia', 'Cerrar', { duration: 2500 });
        }
      });
    }
  }

  removeEducation(index: number): void {
    const edu = this.educations[index];
    if (!edu) return;
    if (window.confirm('¿Estás seguro de que deseas eliminar esta formación?')) {
      const educationId = edu.id || edu.educationId;
      if (!educationId) {
        this.snackbar.open('No se puede eliminar: falta el id de la formación', 'Cerrar', { duration: 2500 });
        return;
      }
      this.authService.deleteEducation(educationId).subscribe({
        next: () => {
          this.educations.splice(index, 1);
          this.snackbar.open('Formación eliminada correctamente', 'Cerrar', { duration: 2000 });
        },
        error: () => {
          this.snackbar.open('Error al eliminar la formación', 'Cerrar', { duration: 2500 });
        }
      });
    }
  }

  currentEducationIndex = 0;

  prevEducation() {
    if (this.currentEducationIndex > 0) {
      this.currentEducationIndex--;
    }
  }

  nextEducation() {
    if (this.currentEducationIndex < this.educations.length - 1) {
      this.currentEducationIndex++;
    }
  }

  goToEducation(index: number) {
    this.currentEducationIndex = index;
  }

  scrollExperienceCarousel(direction: number, carousel: HTMLElement) {
    const cardWidth = carousel.querySelector('.experience-card')?.clientWidth || 340;
    carousel.querySelector('.carousel-cards')?.scrollBy({
      left: direction * (cardWidth + 24),
      behavior: 'smooth'
    });
  }

  scrollEducationCarousel(direction: number, carousel: HTMLElement) {
    const cardWidth = carousel.querySelector('.experience-card')?.clientWidth || 340;
    carousel.querySelector('.carousel-cards')?.scrollBy({
      left: direction * (cardWidth + 24),
      behavior: 'smooth'
    });
  }

  // Sincroniza el dot activo con la card visible en el carrusel de experiencia
  onExperienceCarouselScroll(carousel: HTMLElement) {
    const cards = carousel.querySelectorAll('.experience-card');
    const container = carousel.querySelector('.carousel-cards');
    if (!cards.length || !container) return;
    const scrollLeft = container.scrollLeft;
    let activeIndex = 0;
    for (let i = 0; i < cards.length; i++) {
      if ((cards[i] as HTMLElement).offsetLeft + (cards[i] as HTMLElement).offsetWidth / 2 > scrollLeft) {
        activeIndex = i;
        break;
      }
    }
    this.currentExperienceIndex = activeIndex;
  }

  // Sincroniza el dot activo con la card visible en el carrusel de educación
  onEducationCarouselScroll(carousel: HTMLElement) {
    const cards = carousel.querySelectorAll('.experience-card');
    const container = carousel.querySelector('.carousel-cards');
    if (!cards.length || !container) return;
    const scrollLeft = container.scrollLeft;
    let activeIndex = 0;
    for (let i = 0; i < cards.length; i++) {
      if ((cards[i] as HTMLElement).offsetLeft + (cards[i] as HTMLElement).offsetWidth / 2 > scrollLeft) {
        activeIndex = i;
        break;
      }
    }
    this.currentEducationIndex = activeIndex;
  }


  hasOverflowLeft(carousel: HTMLElement): boolean {
    const container = carousel.querySelector('.carousel-cards') as HTMLElement;
    if (!container) return false;
    return container.scrollLeft > 0;
  }

  hasOverflowRight(carousel: HTMLElement): boolean {
    const container = carousel.querySelector('.carousel-cards') as HTMLElement;
    if (!container) return false;
    return Math.ceil(container.scrollLeft + container.clientWidth) < container.scrollWidth;
  }

}

