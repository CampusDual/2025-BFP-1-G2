import { Component } from '@angular/core';
import { DetailedCardData } from "../../detailed-card/detailed-card.component";
import { AdminService } from 'src/app/services/admin.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';


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

  constructor(private adminService: AdminService,
    private snackBar: MatSnackBar
  ) {
    this.loadCompanies();
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
      },
      error: (error: any) => {
        console.error('Error fetching offers', error);
      }
    });
  }

  openDetailedCard(companyIndex: number) {
    this.detailedCardData = this.companies
      .slice()
      .sort((a, b) => a.login.localeCompare(b.login))
      .map(company => ({
        id: company.id,
        title: company.login.toUpperCase(),
        editableTitle: company.login,
        titleLabel: 'Empresa',
        subtitle: company.email,
        subtitleLabel: 'Email',
        content: company.description,
        contentLabel: 'Descripción',
        editable: true,
        metadata: {
          logo: company.logo,
          telefono: company.phone,
          web: company.url,
          direccion: company.address,
          fundación: new Date(company.foundedDate).getFullYear()
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
    this.currentDetailIndex = companyIndex;
    this.showDetailedCard = true;
  }

  onDetailedCardAction(event: { action: string, data: any }) {
    const { action, data } = event;
    switch (action) {
      case 'editCompany':
        console.log('Editar empresa:', data.Company);
        break;
      case 'deleteCompany':
        if (confirm(`¿Estás seguro de que quieres eliminar la empresa "${data.Company.login}"?`)) {
          this.adminService.deleteCompany(data.Company.id).subscribe({
            next: () => {
              this.showDetailedCard = false;
              this.companies = this.companies.filter(company => company !== data.Company);
              this.loadCompanies();
            },
            error: (error: any) => {
              console.error('Error eliminando empresa', error);
            }
          });
        }

        break;
      default:
        console.log('Acción no reconocida:', action);
    }
  }

  closeDetailedCard() {
    this.showDetailedCard = false;
  }

  onSaveCompany(editedData: DetailedCardData) {
    console.log('Guardando cambios:', editedData);

    if (editedData.id === 0) {
      if (confirm(`¿Crear nueva empresa "${editedData.editableTitle}"?`)) {
        this.adminService.createCompany({
          id: editedData.id as number,
          logo: editedData.metadata?.['logo'] || '',
          login: editedData.editableTitle || '',
          description: editedData.content,
          email: editedData.subtitle || '',
          phone: editedData.metadata?.['telefono'] || '',
          url: editedData.metadata?.['web'] || '',
          address: editedData.metadata?.['direccion'] || '',
          foundedDate: new Date(editedData.metadata?.['fundación'] || new Date()).getTime()
        }).subscribe({
          next: () => {
            this.snackBar.open('Empresa creada correctamente', 'Cerrar', { duration: 3000 });
            this.loadCompanies();
            this.closeDetailedCard();
          },
          error: () => {
            this.snackBar.open('Error al crear la empresa', 'Cerrar', { duration: 3000, panelClass: 'error-snackbar' });
          }
        });
      }
    } else {
      if (confirm(`¿Actualizar empresa "${editedData.title}"?`)) {
        this.adminService.updateCompany({
          id: editedData.id as number,
          logo: editedData.metadata?.['logo'] || '',
          login: editedData.editableTitle || '',
          description: editedData.content,
          email: editedData.subtitle || '',
          phone: editedData.metadata?.['telefono'] || '',
          url: editedData.metadata?.['web'] || '',
          address: editedData.metadata?.['direccion'] || '',
          foundedDate: new Date(editedData.metadata?.['fundación'] || '').getTime()
        }).subscribe({
          next: () => {
            this.snackBar.open('Empresa actualizada correctamente', 'Cerrar', { duration: 3000 });
            this.loadCompanies();
            this.closeDetailedCard();
          },
          error: () => {
            this.snackBar.open('Error al actualizar la empresa', 'Cerrar', { duration: 3000, panelClass: 'error-snackbar' });
          }
        });
      }
    }
  }

  addCompany() {
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
}