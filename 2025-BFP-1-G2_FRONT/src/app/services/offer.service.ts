import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from "../auth/services/auth.service";
import { Candidate } from '../detailed-card/detailed-card.component';
import { Tag } from '../admin/admin-dashboard/admin-dashboard.component';
import { environment } from '../../environments/environment';
import { CompanyService } from './company.service';

export interface Offer {
  id?: number;
  title: string;
  description: string;
  requirements?: string;
  location?: string;
  salary?: number;
  contractType?: string;
  workMode?: string;
  experienceLevel?: string;
  skills?: string[];
  benefits?: string;
  applicationDeadline?: Date;
  dateAdded?: Date;
  tags?: Tag[];
  valid?: Boolean;
  isActive?: boolean;
  companyId?: number;
  companyName?: string;
  email?: string;
  candidatesCount?: number;
  candidates?: Candidate[];
  isValid?: 'VALID' | 'INVALID' | 'PENDING' | null;
  logo?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private baseUrl = `${environment.apiUrl}/offer`;

  constructor(private http: HttpClient,
    private authService: AuthService,
    private companyService: CompanyService) { }
    

  createOffer(offer: Offer): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, offer, { responseType: 'text' });
  }

  getOffers(): Observable<Offer[]> {
    return this.authService.hasRole('ROLE_COMPANY').pipe(
      switchMap(hasRole => {
        if (hasRole) {
          return this.companyService.getMyCompany().pipe(
            switchMap(company => this.companyService.getCompanyOffers(company.id))
          );
        } else {
          console.log('Usuario no es empresa, cargando todas las ofertas');
          return this.http.get<Offer[]>(`${this.baseUrl}/getAll`);
        }
      })
    );
  }
  deleteOffer(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, { responseType: 'text' });
  }
  updateOffer(offer: Offer): Observable<any> {
    return this.http.put(`${this.baseUrl}/update`, offer, { responseType: 'text' });
  }
  applyToOffer(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/apply?offerId=${id}`, {}, { responseType: "text" });
  }
  getCandidates(offerId: number): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.baseUrl}/candidates/${offerId}`);
  }
  updateCandidateStatus(offerId: number, candidate: Candidate): Observable<any> {
    return this.http.post(`${this.baseUrl}/update/${offerId}`, candidate, { responseType: 'text' });
  }
  getCandidateOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.baseUrl}/myOffers`);
  }

}
