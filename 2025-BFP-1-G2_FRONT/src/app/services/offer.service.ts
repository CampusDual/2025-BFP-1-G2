// offer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Offer {
  title: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  private baseUrl = 'http://localhost:30030/offer';

  constructor(private http: HttpClient) { }

  createOffer(offer: Offer): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, offer, {responseType: 'text'});
  }
  getOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.baseUrl}/getAll`);
  }
  deleteOffer(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`, {responseType: 'text'});
  }
  updateOffer(id: number, offer: Offer): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, offer, {responseType: 'text'});
  }
  getCompanyOffers(companyName: string): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.baseUrl}/company/${companyName}`);
  }
  applyToOffer(id: number): Observable<any>{
    return this.http.post(`${this.baseUrl}/apply?offerId=${id}`, {}, { responseType: "text" });
  }
}
