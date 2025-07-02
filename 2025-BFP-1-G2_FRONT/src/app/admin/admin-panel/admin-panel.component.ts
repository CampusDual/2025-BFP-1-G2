import { Component } from '@angular/core';
import { DetailedCardData } from "../../detailed-card/detailed-card.component";
import { AdminService } from 'src/app/services/admin.service';
import { CompanyService, Company } from 'src/app/services/company.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';


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
    private companyService: CompanyService,
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
    this.companyService.getCompanies().subscribe({
      next: (companies: Company[]) => {
        this.companies = companies
          .slice()
          .sort((a, b) => a.login.localeCompare(b.login))
          .map(company => ({
            ...company,
            foundedDate: company.foundedDate ? new Date(company.foundedDate).toISOString().split('T')[0] : ''
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
        ubicacion: company.address,
        web: company.url,
        fundación: company.foundedDate ? new Date(company.foundedDate).getFullYear() : ''
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
      login: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      address: ['', [Validators.maxLength(100)]],
      url: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      phone: ['', [Validators.pattern(/^\+?[0-9\s-]+$/)]],
      foundedDate: [''],
      logo: ['']
    });
  }

  private createCompanyFormForEdit(company: Company): FormGroup {
    const form = this.createCompanyForm();
    form.patchValue({
      login: company.login,
      email: company.email,
      description: company.description,
      address: company.address || '',
      url: company.url || '',
      foundedDate: company.foundedDate || '',
      logo: company.logo || '',
      phone: company.phone || ''
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
      sector: '',
      address: '',
      url: 'https://',
      employeeCount: '',
      foundedDate: '',
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
        sector: '',
        ubicacion: '',
        web: 'https://',
        empleados: '',
        fundación: ''
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
        this.companyService.createCompany({
          id: 0,
          login: formValue.login,
          email: formValue.email,
          description: formValue.description,
          logo: formValue.logo || undefined,
          address: formValue.address || undefined,
          url: formValue.url || undefined,
          foundedDate: formValue.foundedDate || undefined
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
        this.companyService.updateCompany({
          id: editedData.id as number,
          login: formValue.login,
          email: formValue.email,
          description: formValue.description,
          logo: formValue.logo || undefined,
          address: formValue.address || undefined,
          url: formValue.url || undefined,
          foundedDate: formValue.foundedDate || undefined
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
          this.companyService.deleteCompany(data.Company.id).subscribe({
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
