import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { Company } from '../admin/admin-panel/admin-panel.component';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  deleteCompany(companyId: any): Observable<any> {
    return this.http.delete(`${this.baseUrl}/companies/delete/${companyId}`);
  }

  private baseUrl = 'http://localhost:30030/auth';
  
    constructor(private http: HttpClient,
                private authService: AuthService) { }

  getCompanies(): Observable<Company[]> {
    return this.http.get<Company[]>(`${this.baseUrl}/listCompanies`);
  }
}
