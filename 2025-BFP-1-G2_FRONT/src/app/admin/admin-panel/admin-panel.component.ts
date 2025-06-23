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
        this.companies = companies.map((company: Company) => ({
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
    this.detailedCardData = this.companies.map(company => ({
      id: company.id,
      title: company.login.toUpperCase(),
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
    if (confirm(`¿Estás seguro de que actualizar esta empresa? "${editedData.title}"?`)) {
      this.adminService.updateCompany({
        id: editedData.id as number,
        logo: editedData.metadata?.['logo'] || '',
        login: editedData.title,
        description: editedData.content,
        email: editedData.subtitle || '',
        phone: editedData.metadata?.['telefono'] || '',
        url: editedData.metadata?.['web'] || '',
        address: editedData.metadata?.['direccion'] || '',
        foundedDate: new Date(editedData.metadata?.['fundación'] || '').getTime()
      }).subscribe({
        next: () => {
          this.snackBar.open('Empresa actualizada correctamente', 'Cerrar', {duration: 3000});
          this.loadCompanies();
          this.closeDetailedCard();
        },
        error: () => {
          this.snackBar.open('Error al actualizar la empresa', 'Cerrar', {duration: 3000, panelClass: 'error-snackbar'});
        }
      });
    }
  }
}