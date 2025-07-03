import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Company {
  id: number;
  login: string;
  description: string;
  email: string;
  phone?: string;
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

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/getAll`);
  }

  getCompanyById(id: number): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/${id}`);
  }

  createCompany(company: Company): Observable<Company> {
    return this.http.post<Company>(`${this.baseUrl}/create`, company);
  }

  updateCompany(company: Company): Observable<Company> {
    return this.http.put<Company>(`${this.baseUrl}/update`, company);
  }

  // Eliminar empresa
  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getMyCompany(): Observable<Company> {
    return this.http.get<Company>(`${this.baseUrl}/myCompany`);
  }
  
  getCompanyOffers(companyId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${companyId}/offers`);
  }

  searchCompanies(searchTerm: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/search?term=${encodeURIComponent(searchTerm)}`);
  }

  getCompaniesByLocation(location: string): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/byLocation?location=${encodeURIComponent(location)}`);
  }

  getCompanyOffersByStatus(status: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/offers/status?status=${status}`);
  }

  publishOffer(offerId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/offers/publish/${offerId}`, {}, { responseType: 'text' });
  }

  archiveOffer(offerId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/offers/archive/${offerId}`, {}, { responseType: 'text' });
  }

  draftOffer(offerId: number): Observable<any> {
    return this.http.put(`${this.baseUrl}/offers/draft/${offerId}`, {});
  }
}
