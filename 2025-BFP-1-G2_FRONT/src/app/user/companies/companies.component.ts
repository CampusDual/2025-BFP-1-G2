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
    this.loadTags();
  }

  ngOnInit() {
    // Escuchar cambios en el filtro de tags
    this.tagsFilterControl.valueChanges.subscribe(() => {
      this.filterCompanies();
    });
  }

  ngOnDestroy() {
    this.enableBodyScroll();
  }

  loadCompanies() {
    this.isLoading = true;
    
    // Datos mock para testing
    const mockCompanies: Company[] = [
      {
        id: 1,
        name: 'TechCorp Solutions',
        description: 'Empresa líder en desarrollo de software y soluciones tecnológicas innovadoras para empresas de todos los tamaños.',
        email: 'contacto@techcorp.com',
        logo: 'https://via.placeholder.com/150x150/4A90E2/FFFFFF?text=TC',
        sector: 'Tecnología',
        location: 'Madrid, España',
        foundedDate: '2010',
        employeeCount: 250,
        website: 'https://techcorp.com',
        activeOffers: 12,
        tags: [
          { id: 1, name: 'JavaScript' },
          { id: 2, name: 'React' },
          { id: 3, name: 'Node.js' }
        ]
      },
      {
        id: 2,
        name: 'InnovateLab',
        description: 'Laboratorio de innovación especializado en inteligencia artificial y machine learning.',
        email: 'info@innovatelab.com',
        sector: 'I+D',
        location: 'Barcelona, España',
        foundedDate: '2015',
        employeeCount: 80,
        website: 'https://innovatelab.com',
        activeOffers: 8,
        tags: [
          { id: 4, name: 'Python' },
          { id: 5, name: 'AI/ML' },
          { id: 6, name: 'Data Science' }
        ]
      },
      {
        id: 3,
        name: 'GreenEnergy Corp',
        description: 'Compañía dedicada al desarrollo de energías renovables y soluciones sostenibles.',
        email: 'careers@greenenergy.com',
        sector: 'Energía Renovable',
        location: 'Valencia, España',
        foundedDate: '2008',
        employeeCount: 500,
        website: 'https://greenenergy.com',
        activeOffers: 15,
        tags: [
          { id: 7, name: 'Sostenibilidad' },
          { id: 8, name: 'Ingeniería' },
          { id: 9, name: 'Medio Ambiente' }
        ]
      },
      {
        id: 4,
        name: 'Digital Marketing Pro',
        description: 'Agencia de marketing digital especializada en estrategias de crecimiento para startups y PYMES.',
        email: 'hello@digitalmarketingpro.com',
        sector: 'Marketing Digital',
        location: 'Sevilla, España',
        foundedDate: '2018',
        employeeCount: 45,
        activeOffers: 6,
        tags: [
          { id: 10, name: 'Marketing' },
          { id: 11, name: 'SEO/SEM' },
          { id: 12, name: 'Social Media' }
        ]
      }
    ];

    // Simular llamada a API
    setTimeout(() => {
      this.companies = mockCompanies;
      this.filteredCompanies = [...this.companies];
      this.isLoading = false;
      console.log('Companies loaded successfully:', this.companies);
    }, 1000);

    // Versión real comentada para cuando esté disponible el backend
    /*
    this.companyService.getCompanies().subscribe({
      next: (companies: Company[]) => {
        this.companies = companies.map((company: Company) => ({
          ...company,
          dateAdded: company.dateAdded ? new Date(company.dateAdded) : undefined,
          tags: company.tags || []
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
    */
  }

  loadTags() {
    // Datos mock para testing
    const mockTags: Tag[] = [
      { id: 1, name: 'JavaScript' },
      { id: 2, name: 'React' },
      { id: 3, name: 'Node.js' },
      { id: 4, name: 'Python' },
      { id: 5, name: 'AI/ML' },
      { id: 6, name: 'Data Science' },
      { id: 7, name: 'Sostenibilidad' },
      { id: 8, name: 'Ingeniería' },
      { id: 9, name: 'Medio Ambiente' },
      { id: 10, name: 'Marketing' },
      { id: 11, name: 'SEO/SEM' },
      { id: 12, name: 'Social Media' }
    ];

    this.availableTags = mockTags;

    // Versión real comentada para cuando esté disponible el backend
    /*
    this.tagService.getAllTags().subscribe({
      next: (tags: Tag[]) => {
        this.availableTags = tags;
      },
      error: (error: any) => {
        console.error('Error fetching tags', error);
      }
    });
    */
  }

  filterCompanies() {
    let filtered = [...this.companies];

    // Filtrar por término de búsqueda
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchLower) ||
        company.description.toLowerCase().includes(searchLower) ||
        company.sector?.toLowerCase().includes(searchLower) ||
        company.location?.toLowerCase().includes(searchLower)
      );
    }

    // Filtrar por tags seleccionados
    const selectedTags = this.tagsFilterControl.value || [];
    if (selectedTags.length > 0) {
      const selectedTagIds = selectedTags.map(tag => tag.id);
      filtered = filtered.filter(company =>
        company.tags && company.tags.some(tag => selectedTagIds.includes(tag.id))
      );
    }

    this.filteredCompanies = filtered;
  }

  openCompanyDetails(companyIndex: number) {
    this.detailedCardData = this.filteredCompanies.map(company => ({
      id: company.id,
      title: company.name,
      subtitle: company.email,
      content: this.formatCompanyContent(company),
      metadata: this.getMetadataForCompany(company),
      actions: this.getActionsForCompany(company),
      editable: false,
      tags: company.tags || []
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

    if (company.sector) {
      content += `<div class="company-sector">
        <h4>Sector</h4>
        <p>${company.sector}</p>
      </div>`;
    }

    if (company.location) {
      content += `<div class="company-location">
        <h4>Ubicación</h4>
        <p>${company.location}</p>
      </div>`;
    }

    if (company.website) {
      content += `<div class="company-website">
        <h4>Sitio web</h4>
        <p><a href="${company.website}" target="_blank" rel="noopener noreferrer">${company.website}</a></p>
      </div>`;
    }

    content += `</div>`;
    return content;
  }

  private getMetadataForCompany(company: Company): { [key: string]: any } {
    const metadata: { [key: string]: any } = {};

    if (company.foundedDate) {
      metadata['Año de fundación'] = company.foundedDate;
    }

    if (company.employeeCount) {
      metadata['Número de empleados'] = `${company.employeeCount}+`;
    }

    if (company.activeOffers !== undefined) {
      metadata['Ofertas activas'] = company.activeOffers;
    }

    if (company.dateAdded) {
      metadata['Fecha de registro'] = company.dateAdded.toLocaleDateString();
    }

    return metadata;
  }

  private getActionsForCompany(company: Company): DetailedCardAction[] {
    const actions: DetailedCardAction[] = [];

    if (company.activeOffers && company.activeOffers > 0) {
      actions.push({
        label: `Ver ofertas (${company.activeOffers})`,
        action: 'viewOffers',
        color: 'primary',
        icon: 'work',
        data: { companyId: company.id, companyName: company.name }
      });
    }

    if (company.website) {
      actions.push({
        label: 'Visitar sitio web',
        action: 'visitWebsite',
        color: 'accent',
        icon: 'open_in_new',
        data: { website: company.website }
      });
    }

    actions.push({
      label: 'Contactar empresa',
      action: 'contactCompany',
      color: 'primary',
      icon: 'email',
      data: { email: company.email, companyName: company.name }
    });

    return actions;
  }

  onDetailedCardAction(event: { action: string, data: any }) {
    const { action, data } = event;

    switch (action) {
      case 'viewOffers':
        this.viewCompanyOffers(data.companyId, data.companyName);
        break;

      case 'visitWebsite':
        window.open(data.website, '_blank', 'noopener,noreferrer');
        break;

      case 'contactCompany':
        this.contactCompany(data.email, data.companyName);
        break;

      default:
        console.log('Acción no reconocida:', action);
    }
  }

  private viewCompanyOffers(companyId: number, companyName: string) {
    // Aquí podrías navegar a la vista de ofertas filtrada por empresa
    // o mostrar las ofertas de la empresa en un diálogo
    this.snackBar.open(`Navegando a ofertas de ${companyName}`, 'Cerrar', {
      duration: 2000
    });
    this.closeDetailedCard();
  }

  private contactCompany(email: string, companyName: string) {
    const subject = encodeURIComponent(`Consulta sobre ${companyName}`);
    const body = encodeURIComponent(`Hola,\n\nEstoy interesado/a en conocer más sobre ${companyName}.\n\nSaludos cordiales.`);
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
