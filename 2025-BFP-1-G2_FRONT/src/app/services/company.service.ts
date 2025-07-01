import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag } from '../admin/admin-dashboard/admin-dashboard.component';
import { environment } from '../../environments/environment';

export interface Company {
  id: number;
  name: string;
  description: string;
  email: string;
  logo?: string;
  sector?: string;
  location?: string;
  foundedDate?: string;
  employeeCount?: number;
  website?: string;
  activeOffers?: number;
  tags?: Tag[];
  dateAdded?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class CompanyService {

  private baseUrl = `${environment.apiUrl}/company`;

  constructor(private http: HttpClient) { }

  // Obtener todas las empresas (para candidatos)
  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/getAll`);
  }

  // Obtener empresa específica por ID
  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`);
  }

  // Obtener ofertas de una empresa específica
  getCompanyOffers(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${companyId}/offers`);
  }

  // Buscar empresas por término
  searchCompanies(searchTerm: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/search?term=${encodeURIComponent(searchTerm)}`);
  }

  // Filtrar empresas por tags
  getCompaniesByTags(tagIds: number[]): Observable<Company[]> {
    const tagParam = tagIds.join(',');
    return this.http.get<Company[]>(`${this.baseUrl}/byTags?tags=${tagParam}`);
  }
}
