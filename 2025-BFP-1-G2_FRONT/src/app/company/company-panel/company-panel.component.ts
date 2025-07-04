import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatIconModule} from "@angular/material/icon";
import {NgClass, NgStyle} from "@angular/common";
import {CommonModule} from "@angular/common";
import {ImageCompressionService} from "../../services/image-compression.service";
import {CompanyService} from "../../services/company.service";


@Component({
  selector: 'app-company-panel',
  templateUrl: './company-panel.component.html',
  styleUrls: ['./company-panel.component.css']
})
export class CompanyPanelComponent implements OnInit {

  companyName = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]);
  description = new FormControl('', [Validators.maxLength(1000)]);
  companyEmail = new FormControl('', [Validators.required, Validators.email]);
  login = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]);
  phone = new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern('^[0-9]+$')]);

  location = new FormControl('', [Validators.maxLength(100)]);
  linkedinUrl = new FormControl('');
  url = new FormControl('');

  logo = new FormControl('');

  isUploadingLogo: boolean = false;
  logoFileName: string = '';

  fullName: string = '';

  isLoading: boolean = true;
  userRole: string = '';
  isEditMode: boolean = false;
  isSaving: boolean = false;
  constructor(
    private companyService : CompanyService,
    private imageCompressionService: ImageCompressionService) {}

  ngOnInit(): void {
    this.loadUserData();
  }

  loadUserData(): void {
    this.companyService.getMyCompany().subscribe({
      next: (company: any) => {
        console.log('Datos recibidos del backend:', company); // Debug log
        console.log('Logo en base64:', company.logo ? 'Existe' : 'No existe'); // Debug log

        this.companyName.setValue(company.name);
        this.description.setValue(company.description || '');
        this.companyEmail.setValue(company.email);
        this.login.setValue(company.login || company.companyName);
        this.phone.setValue(company.phone || '');

        this.location.setValue(company.location);
        this.linkedinUrl.setValue(company.linkedinUrl); //pendiente
        this.url.setValue(company.url);

        console.log('Cargando logoImageBase64:', company.logo ? 'Existe' : 'No existe');
        this.logo.setValue(company.logo || '');

        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching user data', error);
        this.isLoading = false;
      }
    });
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
    this.logo.setValue('');
  }

  getProfileImage(): string | null {
    if (this.logo.value) {
      return this.logo.value;
    }
    return null;
  }

  onLogoError(): void {
    console.warn('Error al cargar el logo, pero manteniendo el valor');
  }

  saveChanges(): void {
    if (this.isSaving) return;

    this.companyName.markAsTouched();
    this.description.markAsTouched();
    this.companyEmail.markAsTouched();
    this.login.markAsTouched();
    this.phone.markAsTouched();
    this.location.markAsTouched();
    this.linkedinUrl.markAsTouched();
    this.url.markAsTouched();
    this.logo.markAsTouched();


    if (this.hasFormErrors()) {
      console.error('Hay errores en el formulario');
      return;
    }

    this.isSaving = true;
    const updatedData = {
      name: this.companyName.value,
      email: this.companyEmail.value,
      login: this.login.value,
      phoneNumber: this.phone.value,
      location: this.location.value,
      linkedinUrl: this.linkedinUrl.value,
      url: this.url.value,
      logo: this.logo.value
    };

    this.companyService.updateCompanyDetails(updatedData).subscribe({
      next: (response) => {
        console.log('Datos actualizados exitosamente', response);
        this.isEditMode = false;
        this.isSaving = false;
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
    return this.companyName.invalid || this.companyEmail.invalid || this.login.invalid || this.phone.invalid ||
      this.location.invalid ;
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
      this.logo.setValue(compressedBase64);
      this.logoFileName = file.name;
      console.log('Logo comprimido y cargado exitosamente');
    } catch (error) {
      console.error('Error al comprimir el logo:', error);
      alert('Error al procesar la imagen del logo');
    } finally {
      this.isUploadingLogo = false;
      event.target.value = '';
    }
  }

  removeLogoImage(): void {
    this.logo.setValue('');
    this.logoFileName = '';
  }

  openFileSelector(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
      if(!this.isEditMode){
        this.saveChanges();
      }
    }
  }
}
