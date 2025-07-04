import {Component, OnInit, OnDestroy} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ImageCompressionService} from "../../services/image-compression.service";
import {Company, CompanyService} from "../../services/company.service";

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

  address = new FormControl('', [Validators.maxLength(100)]);
  url = new FormControl('');

  logo = new FormControl('');

  isUploadingLogo: boolean = false;
  logoFileName: string = '';

  fullName: string = '';

  isLoading: boolean = true;
  isEditMode: boolean = false;
  isSaving: boolean = false;
  constructor(
    private companyService : CompanyService,
    private imageCompressionService: ImageCompressionService) {}

  ngOnInit(): void {
    this.loadCompanyData();
  }

  loadCompanyData(): void {
    this.companyService.getMyCompany().subscribe({
      next: (company: any) => {
        console.log('Datos recibidos del backend:', company); // Debug log
        console.log('Logo en base64:', company.logo ? 'Existe' : 'No existe'); // Debug log

        this.companyName.setValue(company.name);
        this.description.setValue(company.description || '');
        this.companyEmail.setValue(company.email);
        this.login.setValue(company.login || company.companyName);
        this.phone.setValue(company.phone || '');

        this.address.setValue(company.address);
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

    // Validar campos
    this.companyName.markAsTouched();
    this.description.markAsTouched();
    this.companyEmail.markAsTouched();
    this.login.markAsTouched();
    this.phone.markAsTouched();
    this.address.markAsTouched();
    this.url.markAsTouched();
    this.logo.markAsTouched();

    if (this.hasFormErrors()) {
      console.error('Hay errores en el formulario');
      return;
    }

    this.isSaving = true;

    // Crear interfaz específica para actualización
    interface CompanyUpdate {
      name?: string;
      login?: string;
      description?: string;
      email?: string;
      phone?: string;
      address?: string;
      url?: string;
      logo?: string;
    }

    const companyData: CompanyUpdate = {
      name: this.companyName.value || undefined,
      login: this.login.value || undefined,
      description: this.description.value || undefined,
      email: this.companyEmail.value || undefined,
      phone: this.phone.value || undefined,
      address: this.address.value || undefined,
      url: this.url.value || undefined,
      logo: this.logo.value || undefined
    };

    this.companyService.updateCompanyDetails(companyData).subscribe({
      next: (response) => {
        console.log('Datos actualizados correctamente');
        this.loadCompanyData(); // Recargar datos
        this.isEditMode = false;
        this.isSaving = false;
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.isSaving = false;
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.loadCompanyData();
  }

  hasFormErrors(): boolean {
    return this.companyName.invalid || this.companyEmail.invalid || this.login.invalid || this.phone.invalid ||
      this.address.invalid ;
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
