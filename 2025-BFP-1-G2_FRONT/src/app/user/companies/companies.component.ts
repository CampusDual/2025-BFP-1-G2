import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyService, Company } from '../../services/company.service';
import { TagService } from '../../services/tag.service';
import { DetailedCardData, DetailedCardAction } from '../../detailed-card/detailed-card.component';
import { Tag } from '../../admin/admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit, OnDestroy {

  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  searchTerm: string = '';
  availableTags: Tag[] = [];
  tagsFilterControl = new FormControl<Tag[]>([]);
  
  isLoading: boolean = true;
  showDetailedCard = false;
  detailedCardData: DetailedCardData[] = [];
  currentDetailIndex = 0;

  constructor(
    private companyService: CompanyService,
    private tagService: TagService,
    private snackBar: MatSnackBar
  ) {
    this.loadCompanies();
  }

  ngOnInit() {
    this.tagsFilterControl.valueChanges.subscribe(() => {
      this.filterCompanies();
    });
  }

  ngOnDestroy() {
    this.enableBodyScroll();
  }

  loadCompanies() {
    this.isLoading = true;

    this.companyService.getCompanies().subscribe({
      next: (companies: Company[]) => {
        this.companies = companies.map((company: Company) => ({
          ...company,
          dateAdded: company.foundedDate ? new Date(company.foundedDate) : undefined
        }));
        this.filteredCompanies = [...this.companies];
        this.isLoading = false;
        console.log('Companies loaded successfully:', this.companies);
      },
      error: (error: any) => {
        console.error('Error fetching companies', error);
        this.isLoading = false;
        this.snackBar.open('Error al cargar las empresas', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
      }
    });

  }

  filterCompanies() {
    let filtered = [...this.companies];

    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(company =>
        company.login.toLowerCase().includes(searchLower) ||
        company.description.toLowerCase().includes(searchLower) ||
        company.address?.toLowerCase().includes(searchLower)
      );
    }

    this.filteredCompanies = filtered;
  }

  openCompanyDetails(companyIndex: number) {
    this.detailedCardData = this.filteredCompanies.map(company => ({
      id: company.id,
      title: company.login,
      subtitle: company.email,
      content: this.formatCompanyContent(company),
      metadata: this.getMetadataForCompany(company),
      actions: this.getActionsForCompany(company),
      editable: false,
    }));

    this.currentDetailIndex = companyIndex;
    this.showDetailedCard = true;
    this.disableBodyScroll();
  }

  private formatCompanyContent(company: Company): string {
    let content = `<div class="company-detail-content">`;
    
    if (company.description) {
      content += `<div class="company-description">
        <h4>Descripción</h4>
        <p>${company.description}</p>
      </div>`;
    }

    if (company.address) {
      content += `<div class="company-address">
        <h4>Ubicación</h4>
        <p>${company.address}</p>
      </div>`;
    }

    if (company.url) {
      content += `<div class="company-url">
        <h4>Sitio web</h4>
        <p><a href="${company.url}" target="_blank" rel="noopener noreferrer">${company.url}</a></p>
      </div>`;
    }

    content += `</div>`;
    return content;
  }

  private getMetadataForCompany(company: Company): { [key: string]: any } {
    const metadata: { [key: string]: any } = {};

    if (company.foundedDate) {
      metadata['Año de fundación'] = company.foundedDate? new Date(company.foundedDate).getFullYear() : 'Desconocido';
    }

    return metadata;
  }

  private getActionsForCompany(company: Company): DetailedCardAction[] {
    const actions: DetailedCardAction[] = [];

    if (company.url) {
      actions.push({
        label: 'Visitar sitio web',
        action: 'visiturl',
        color: 'accent',
        icon: 'open_in_new',
        data: { url: company.url }
      });
    }

    actions.push({
      label: 'Contactar empresa',
      action: 'contactCompany',
      color: 'primary',
      icon: 'email',
      data: { email: company.email, companylogin: company.login }
    });

    return actions;
  }

  onDetailedCardAction(event: { action: string, data: any }) {
    const { action, data } = event;

    switch (action) {
      case 'viewOffers':
        this.viewCompanyOffers(data.companyId, data.companylogin);
        break;

      case 'visiturl':
        window.open(data.url, '_blank', 'noopener,noreferrer');
        break;

      case 'contactCompany':
        this.contactCompany(data.email, data.companylogin);
        break;

      default:
        console.log('Acción no reconocida:', action);
    }
  }

  private viewCompanyOffers(companyId: number, companylogin: string) {
    this.snackBar.open(`Navegando a ofertas de ${companylogin}`, 'Cerrar', {
      duration: 2000
    });
    this.closeDetailedCard();
  }

  private contactCompany(email: string, companylogin: string) {
    const subject = encodeURIComponent(`Consulta sobre ${companylogin}`);
    const body = encodeURIComponent(`Hola,\n\nEstoy interesado/a en conocer más sobre ${companylogin}.\n\nSaludos cordiales.`);
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
  }

  onDetailedCardNavigate(index: number) {
    this.currentDetailIndex = index;
  }

  closeDetailedCard() {
    this.showDetailedCard = false;
    this.enableBodyScroll();
  }

  onImageError(event: any) {
    event.target.style.display = 'none';
  }

  private disableBodyScroll() {
    document.body.style.overflow = 'hidden';
  }

  private enableBodyScroll() {
    document.body.style.overflow = 'auto';
  }
}
