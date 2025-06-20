import { Component } from '@angular/core';
import { DetailedCardData } from "../../detailed-card/detailed-card.component";
import { AdminService } from 'src/app/services/admin.service';


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

  constructor(private adminService: AdminService) {
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
      subtitle: company.email,
      content: "",
      metadata: {
        telefono: company.phone,
        web: company.url,
        direccion: company.address,
        fundación: new Date(company.foundedDate).getFullYear(),
        descripción: company.description
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
}
