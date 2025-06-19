// offer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import {AuthService, User} from "../auth/services/auth.service";

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
    return this.http.delete(`${this.baseUrl}/delete/${id}`, {responseType: 'text'});
  }
  updateOffer(id: number, offer: Offer): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, offer, {responseType: 'text'});
  }
  applyToOffer(id: number): Observable<any>{
    return this.http.post(`${this.baseUrl}/apply?offerId=${id}`, {}, { responseType: "text" });
  }
  getCandidates(offerId: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}/candidates/${offerId}`);
  }
}
