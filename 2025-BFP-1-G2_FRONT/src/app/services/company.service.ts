import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Company {
  id: number;
  login: string;
  description: string;
  email: string;
  logo?: string;
  address?: string;
  foundedDate?: string;
  url?: string;
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

  // Crear nueva empresa
  createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/create`, company);
  }

  // Actualizar empresa existente
  updateCompany(company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/update`, company);
  }

  // Eliminar empresa
  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Obtener ofertas de una empresa específica
  getCompanyOffers(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${companyId}/offers`);
  }

  // Buscar empresas por término
  searchCompanies(searchTerm: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/search?term=${encodeURIComponent(searchTerm)}`);
  }

  // Obtener empresas por ubicación
  getCompaniesByLocation(location: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/byLocation?location=${encodeURIComponent(location)}`);
  }
}
