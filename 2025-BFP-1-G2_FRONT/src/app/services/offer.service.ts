// offer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { AuthService } from "../auth/services/auth.service";
import { Candidate } from '../detailed-card/detailed-card.component';
import { Tag } from '../admin/admin-dashboard/admin-dashboard.component';

export interface Offer {
  id?: number;
  title: string;
  description: string;
  dateAdded?: Date;
  tags?: Tag[];
}

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  private baseUrl = 'http://localhost:30030/offer';
  private authUrl = 'http://localhost:30030/auth';

  constructor(private http: HttpClient,
    private authService: AuthService) { }

  createOffer(offer: Offer): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, offer, { responseType: 'text' });
  }

  getOffers(): Observable<Offer[]> {
    return this.authService.hasRole('ROLE_COMPANY').pipe(
      switchMap(hasRole => {
        if (hasRole) {
          console.log('Usuario es empresa, cargando ofertas de empresa');
          return this.http.get<Offer[]>(`${this.baseUrl}/companyOffers`);
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
  getAllTags(): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.authUrl}/tags/list`);
  }
  getOfferTags(offerId: number): Observable<Tag[]> {
    return this.http.get<Tag[]>(`${this.baseUrl}/offers/${offerId}/tags`);
  }


  addTagsToOffer(offerId: number, tagIds: number[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/offers/${offerId}/tags`,
      { tagIds },
      { responseType: 'text' }
    );
  }


  removeTagFromOffer(offerId: number, tagId: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/offers/${offerId}/tags/${tagId}`,
      { responseType: 'text' }
    );
  }


  updateOfferTags(offerId: number, tagIds: number[]): Observable<any> {
    return this.http.put(`${this.baseUrl}/offers/${offerId}/tags`,
      { tagIds },
      { responseType: 'text' }
    );
  }
}
