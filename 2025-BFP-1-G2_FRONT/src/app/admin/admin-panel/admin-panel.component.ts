import { Component } from '@angular/core';
import { DetailedCardData } from "../../detailed-card/detailed-card.component";
import { AdminService } from 'src/app/services/admin.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


export interface Company {
  id: number;
  logo: string;
  login: string;
  description: string;
  email: string;
  phone: string;
  url: string;
  address: string;
  foundedDate: number;
}

@Component({
  selector: 'app-admin-panel',
  templateUrl: './admin-panel.component.html',
  styleUrls: ['./admin-panel.component.css']
})

export class AdminPanelComponent {
  companies: Company[] = [];
  showDetailedCard = false;
  detailedCardData: DetailedCardData[] = [];
  currentDetailIndex = 0;
  companyForm: FormGroup;
  isAddingNewCompany = false;
  isLoading = true;

  constructor(
    private adminService: AdminService,
    private snackBar: MatSnackBar,
    private fb: FormBuilder
  ) {
    this.loadCompanies();
    this.companyForm = this.createCompanyForm();
  }

  selectedCompany: Company | null = null;

  openCard(company: Company) {
    this.selectedCompany = company;
  }

  closeCard() {
    this.selectedCompany = null;
  }

  loadCompanies() {
    this.adminService.getCompanies().subscribe({
      next: (companies: Company[]) => {
        this.companies = companies
          .slice()
          .sort((a, b) => a.login.localeCompare(b.login))
          .map(company => ({
            id: company.id,
            logo: company.logo,
            login: company.login,
            description: company.description,
            email: company.email,
            phone: company.phone,
            url: company.url,
            address: company.address,
            foundedDate: new Date(company.foundedDate).getFullYear()
          }));
        if (!this.isAddingNewCompany) {
          this.createDetailedCardData();
          this.isLoading = false;
        }
      },
      error: (error: any) => {
        console.error('Error fetching companies', error);
      }
    });
  }

  private createDetailedCardData() {
    this.detailedCardData = this.companies.map(company => ({
      id: company.id,
      title: company.login.toUpperCase(),
      editableTitle: company.login,
      titleLabel: 'Empresa',
      subtitle: company.email,
      subtitleLabel: 'Email',
      content: company.description,
      contentLabel: 'Descripción',
      editable: true,
      form: this.createCompanyFormForEdit(company),
      metadata: {
        logo: company.logo,
        telefono: company.phone,
        web: company.url,
        direccion: company.address,
        fundación: company.foundedDate
      },
      actions: [
        {
          label: 'Eliminar empresa',
          action: 'deleteCompany',
          color: 'warn',
          icon: 'delete',
          data: { Company: company }
        }
      ]
    }));
  }

  private createCompanyForm(): FormGroup {
    return this.fb.group({
      login: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(50)]],
      email: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      phone: ['', [Validators.required, Validators.pattern(/^[+]?[\d\s\-\(\)]+$/)]],
      url: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      foundedDate: ['', [Validators.required, Validators.min(1800), Validators.max(new Date().getFullYear())]],
      logo: ['']
    });
  }

  private createCompanyFormForEdit(company: Company): FormGroup {
    const form = this.createCompanyForm();
    form.patchValue({
      login: company.login,
      email: company.email,
      description: company.description,
      phone: company.phone,
      url: company.url,
      address: company.address,
      foundedDate: company.foundedDate,
      logo: company.logo
    });
    return form;
  }

  openDetailedCard(companyIndex: number) {
    this.isAddingNewCompany = false;
    this.createDetailedCardData();
    this.currentDetailIndex = companyIndex;
    this.showDetailedCard = true;
  }

  closeDetailedCard() {
    this.showDetailedCard = false;
    this.isAddingNewCompany = false;
    this.currentDetailIndex = 0;
  }

  addCompany() {
    this.isAddingNewCompany = true;

    const newCompanyForm = this.createCompanyForm();
    newCompanyForm.reset({
      login: '',
      email: '',
      description: '',
      phone: '',
      url: 'https://',
      address: '',
      foundedDate: new Date().getFullYear(),
      logo: ''
    });

    this.detailedCardData = [{
      id: 0,
      title: '',
      editableTitle: '',
      titleLabel: 'Nombre de la Empresa',
      subtitle: '',
      subtitleLabel: 'Email Corporativo',
      content: '',
      contentLabel: 'Descripción de la Empresa',
      editable: true,
      form: newCompanyForm,
      metadata: {
        logo: '',
        telefono: '',
        web: 'https://',
        direccion: '',
        fundación: new Date().getFullYear()
      }
    }];

    this.currentDetailIndex = 0;
    this.showDetailedCard = true;
  }

  onSaveCompany(editedData: DetailedCardData) {
    const form = editedData.form!;

    if (form.invalid) {
      form.markAllAsTouched();
      this.snackBar.open('Por favor, corrija los errores en el formulario', 'Cerrar', {
        duration: 3000,
        panelClass: 'error-snackbar'
      });
      return;
    }

    const formValue = form.value;

    if (this.isAddingNewCompany) {
      if (confirm(`¿Crear nueva empresa "${formValue.login}"?`)) {
        this.adminService.createCompany({
          id: 0,
          logo: formValue.logo || '',
          login: formValue.login,
          description: formValue.description,
          email: formValue.email,
          phone: formValue.phone,
          url: formValue.url,
          address: formValue.address,
          foundedDate: new Date(formValue.foundedDate, 0, 1).getTime()
        }).subscribe({
          next: () => {
            this.snackBar.open('Empresa creada correctamente', 'Cerrar', { duration: 3000 });
            this.isAddingNewCompany = false;
            this.currentDetailIndex = 0;
            this.loadCompanies();
            this.closeDetailedCard();
          },
          error: () => {
            this.snackBar.open('Error al crear la empresa', 'Cerrar', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
      }
    } else {
      if (confirm(`¿Actualizar empresa "${formValue.login}"?`)) {
        this.adminService.updateCompany({
          id: editedData.id as number,
          logo: formValue.logo || '',
          login: formValue.login,
          description: formValue.description,
          email: formValue.email,
          phone: formValue.phone,
          url: formValue.url,
          address: formValue.address,
          foundedDate: new Date(formValue.foundedDate, 0, 1).getTime()
        }).subscribe({
          next: () => {
            this.snackBar.open('Empresa actualizada correctamente', 'Cerrar', { duration: 3000 });
            this.loadCompanies();
            this.closeDetailedCard();
          },
          error: () => {
            this.snackBar.open('Error al actualizar la empresa', 'Cerrar', {
              duration: 3000,
              panelClass: 'error-snackbar'
            });
          }
        });
      }
    }
  }

  onDetailedCardAction(event: { action: string, data: any }) {
    const { action, data } = event;
    switch (action) {
      case 'deleteCompany':
        if (confirm(`¿Estás seguro de que quieres eliminar la empresa "${data.Company.login}"?`)) {
          this.adminService.deleteCompany(data.Company.id).subscribe({
            next: () => {
              this.showDetailedCard = false;
              this.isAddingNewCompany = false;
              this.currentDetailIndex = 0;
              this.loadCompanies();
              this.snackBar.open('Empresa eliminada correctamente', 'Cerrar', { duration: 3000 });
            },
            error: (error: any) => {
              console.error('Error eliminando empresa', error);
              this.snackBar.open('Error al eliminar la empresa', 'Cerrar', {
                duration: 3000,
                panelClass: 'error-snackbar'
              });
            }
          });
        }
        break;
      case 'reloadCompanies':
        this.isAddingNewCompany = false;
        this.currentDetailIndex = 0;
        this.loadCompanies();
        break;
      default:
        console.log('Acción no reconocida:', action);
    }
  }
}
