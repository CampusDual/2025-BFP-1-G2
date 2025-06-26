import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { Company } from '../admin/admin-panel/admin-panel.component';
import { Observable } from 'rxjs';
import { tag } from '../admin/admin-dashboard/admin-dashboard.component';



@Injectable({
  providedIn: 'root'
})
export class AdminService {

  deleteCompany(companyId: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/companies/delete/${companyId}`);
  }

  private baseUrl = 'http://localhost:30030/auth';

    constructor(private http: HttpClient) { }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/listCompanies`);
  }

  updateCompany(company: Company): Observable<number> {
    return this.http.put<number>(`${this.baseUrl}/companies/edit`, company);
  }

  createCompany(company: Company): Observable<number> {
    return this.http.post<number>(`${this.baseUrl}/companies/add`, company);
  }

  getAllTags() : Observable<tag[]> {
    return this.http.get<tag[]>(`${this.baseUrl}/tags/list`);
  }
}
