import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ImageCompressionService } from "../../services/image-compression.service";
import { CompanyService } from "../../services/company.service";
import { Company } from 'src/app/models/company.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import {ActivatedRoute, ROUTES} from '@angular/router';
import { AuthService } from 'src/app/auth/services/auth.service';
import { Router } from '@angular/router';

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
  foundedDate = new FormControl('', [Validators.pattern('^(19|20)\\d{2}$')]);
  isUploadingLogo: boolean = false;
  logoFileName: string = '';
  fullName: string = '';
  isLoading: boolean = true;
  isEditMode: boolean = false;
  isSaving: boolean = false;
  isCreatingNewCompany: boolean = false;
  isCompany: boolean = false;
  isAdmin: boolean = false;
  constructor(
    private companyService: CompanyService,
    private imageCompressionService: ImageCompressionService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router,
    protected authService: AuthService) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const companyName = params.get('companyName');
      if (companyName) {
        this.companyNameInput = companyName;
        this.loadCompanyData();
        this.authService.hasRole('ROLE_COMPANY').subscribe({
          next: (hasRole: boolean) => {
            if (hasRole) {
              this.isCompany = true;
            }
          },
          error: (error: any) => {
            console.error('Error checking user role', error);
            this.isLoading = false;
          }
        });
      } else {
        if (this.authService.getRolesCached().includes('ROLE_ADMIN')) {
          this.isAdmin = true;
          this.isCreatingNewCompany = true;
          this.loadEmptyCompanyData();
        }
      }
    });
  }

  loadCompanyData() {
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
        const fullDate = company.foundedDate  || '';
        const year = fullDate ? new Date(fullDate).getFullYear().toString() : '';
        this.foundedDate.setValue(year);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error fetching user data', error);
        this.isLoading = false;
      }
    });
  }


  loadEmptyCompanyData(): void {
      this.isLoading = true;
      this.myCompany = null;
      this.companyName.setValue('');
      this.description.setValue('');
      this.companyEmail.setValue('');
      this.phone.setValue('');
      this.address.setValue('');
      this.url.setValue('');
      this.logo.setValue('');
      this.foundedDate.setValue('');
      this.isLoading = false;
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
      foundedDate: this.foundedDate.value ? `${this.foundedDate.value}-01-01` : undefined
    };

    if (this.isCreatingNewCompany) {
      this.createCompany(companyData);
    }
    else if (this.isEditMode) {
      this.updateCompany(companyData);
    }
  }

  updateCompany(companyData: Company): void {
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

  createCompany(companyData: Company): void {
    this.companyService.createCompany(companyData).subscribe({
      next: () => {
        console.log('Empresa creada correctamente');
        this.snackbar.open('Empresa creada correctamente', 'Cerrar', { duration: 3000 });
        this.isCreatingNewCompany = false;
        this.loadEmptyCompanyData();
        this.isEditMode = false;
        this.router.navigate(['/company/profile/' + companyData.name]);
      },
      error: (error) => {
        console.error('Error al crear la empresa:', error);
        this.snackbar.open('Error al crear la empresa', 'Cerrar', { panelClass: 'mat-error' });
      },
      complete: () => {
        this.isSaving = false;
      }
    });
  }


  cancelEdit(): void {
    if(this.isEditMode){
      this.loadCompanyData();
      this.isEditMode = false;
    }else if (this.isCreatingNewCompany) {
      this.loadEmptyCompanyData();
      this.isCreatingNewCompany = false;
    }
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
