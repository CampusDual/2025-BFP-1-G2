import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ImageCompressionService } from "../../services/image-compression.service";
import { Company, CompanyService } from "../../services/company.service";
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';

@Component({
  selector: 'app-company-panel',
  templateUrl: './company-panel.component.html',
  styleUrls: ['./company-panel.component.css']
})


export class CompanyPanelComponent implements OnInit {
  companyNameInput: string = '';
  myCompany: Company | null = null;
  companyName = new FormControl('', [Validators.required, Validators.minLength(3), Validators.maxLength(30)]);
  description = new FormControl('', [Validators.maxLength(1000)]);
  companyEmail = new FormControl('', [Validators.required, Validators.email]);
  phone = new FormControl('', [Validators.required, Validators.minLength(9), Validators.maxLength(9), Validators.pattern('^[0-9]+$')]);
  address = new FormControl('', [Validators.maxLength(100)]);
  url = new FormControl('');
  logo = new FormControl('');
  foundedDate = new FormControl('', [Validators.pattern('^(19|20)\\d{2}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])$')]);
  isUploadingLogo: boolean = false;
  logoFileName: string = '';
  fullName: string = '';
  isLoading: boolean = true;
  isEditMode: boolean = false;
  isSaving: boolean = false;
  isCompany: boolean = false;
  constructor(
    private companyService: CompanyService,
    private imageCompressionService: ImageCompressionService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private authService: AuthService) { }

  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const companyName = params.get('companyName');
      if (companyName) {
        this.companyNameInput = companyName;
        this.authService.hasRole('ROLE_COMPANY').subscribe({
          next: (hasRole: boolean) => {
            if (hasRole) {
              this.isCompany = true;
              this.loadCompanyData();
            }
            else {
              this.loadSpecificCompanyData();
            }
          },
          error: (error: any) => {
            console.error('Error checking user role', error);
            this.isLoading = false;
          }
        });
      }
    });
  }

  loadSpecificCompanyData() {
    this.companyService.getCompanyByName(this.companyNameInput).subscribe({
      next: (company: any) => {
        this.myCompany = company;
        this.companyName.setValue(this.myCompany?.name || '');
        this.description.setValue(this.myCompany?.description || '');
        this.companyEmail.setValue(this.myCompany?.email || '');
        this.phone.setValue(this.myCompany?.phone || '');
        this.address.setValue(company.address || '');
        this.url.setValue(company.url || '');
        this.logo.setValue(company.logo || '');
        this.foundedDate.setValue(company.foundedDate || '');
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching user data', error);
        this.isLoading = false;
      }
    });
  }

  loadCompanyData(): void {
    this.companyService.getMyCompany().subscribe({
      next: (company: any) => {
        this.myCompany = company;
        this.companyName.setValue(this.myCompany?.name || '');
        this.description.setValue(this.myCompany?.description || '');
        this.companyEmail.setValue(this.myCompany?.email || '');
        this.phone.setValue(this.myCompany?.phone || '');
        this.address.setValue(company.address || '');
        this.url.setValue(company.url || '');
        this.logo.setValue(company.logo || '');
        this.foundedDate.setValue(company.foundedDate || '');
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
    this.companyName.markAsTouched();
    this.description.markAsTouched();
    this.companyEmail.markAsTouched();
    this.phone.markAsTouched();
    this.address.markAsTouched();
    this.url.markAsTouched();
    this.logo.markAsTouched();
    this.foundedDate.markAsTouched();

    if (this.hasFormErrors()) {
      console.error('Hay errores en el formulario');
      return;
    }

    this.isSaving = true;

    const companyData: Company = {
      id: this.myCompany?.id || 0,
      name: this.companyName.value || '',
      description: this.description.value || '',
      email: this.companyEmail.value || '',
      phone: this.phone.value || undefined,
      address: this.address.value || undefined,
      url: this.url.value || undefined,
      logo: this.logo.value || undefined,
      foundedDate: this.foundedDate.value || undefined
    };


    this.companyService.updateCompany(companyData).subscribe({
      next: () => {
        console.log('Datos actualizados correctamente');
        this.loadCompanyData();
        this.isEditMode = false;
        this.isSaving = false;
        this.snackbar.open('Datos actualizados correctamente', 'Cerrar', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error al actualizar:', error);
        this.snackbar.open('Error al actualizar:', 'Cerrar', { panelClass: 'mat-error' });
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
    return this.companyName.invalid || this.companyEmail.invalid || this.phone.invalid ||
      this.address.invalid;
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
      this.saveChanges();
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
    }
  }
}
