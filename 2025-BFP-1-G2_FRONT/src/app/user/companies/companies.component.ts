import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CompanyService, Company } from '../../services/company.service';
import { Tag } from '../../admin/admin-dashboard/admin-dashboard.component';

@Component({
  selector: 'app-companies',
  templateUrl: './companies.component.html',
  styleUrls: ['./companies.component.css']
})
export class CompaniesComponent implements OnInit {

  companies: Company[] = [];
  filteredCompanies: Company[] = [];
  searchTerm: string = '';
  availableTags: Tag[] = [];
  tagsFilterControl = new FormControl<Tag[]>([]);
  isLoading: boolean = true;

  constructor(
    private companyService: CompanyService,
    private snackBar: MatSnackBar
  ) {
    this.loadCompanies();
  }

  ngOnInit() {
    this.tagsFilterControl.valueChanges.subscribe(() => {
      this.filterCompanies();
    });
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
        company.name.toLowerCase().includes(searchLower) ||
        company.description.toLowerCase().includes(searchLower) ||
        company.address?.toLowerCase().includes(searchLower)
      );
    }

    this.filteredCompanies = filtered;
  }


  onImageError(event: any) {
    event.target.style.display = 'none';
  }

}
