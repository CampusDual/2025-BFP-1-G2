// offer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthService} from "../auth/services/auth.service";

export interface Offer {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  private baseUrl = 'http://localhost:30030/offer';

  constructor(private http: HttpClient,
              private authService: AuthService) { }

  createOffer(offer: Offer): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, offer, {responseType: 'text'});
  }
  getOffers(): Observable<Offer[]> {
    this.authService.hasRole('ROLE_COMPANY').subscribe({
      next: (hasRole) => {
        if (hasRole) {
          return this.http.get<Offer[]>(`${this.baseUrl}/companyOffers`);
        } else {
          return this.http.get<Offer[]>(`${this.baseUrl}/getAll`);
        }
      },
      error: (error) => {
        return this.http.get<Offer[]>(`${this.baseUrl}/getAll`);
      }
    });
    return this.http.get<Offer[]>(`${this.baseUrl}/getAll`);
  }
  deleteOffer(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, {responseType: 'text'});
  }
  updateOffer(id: number, offer: Offer): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, offer, {responseType: 'text'});
  }
  applyToOffer(id: number): Observable<any>{
    return this.http.post(`${this.baseUrl}/apply?offerId=${id}`, {}, { responseType: "text" });
  }
}
