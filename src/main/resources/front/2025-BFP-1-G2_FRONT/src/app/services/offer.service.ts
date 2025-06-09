// offer.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Offer {
  title: string;
  description: string;
  // otros campos que necesites...
}

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  private baseUrl = 'http://localhost:8080/api/offers';

  constructor(private http: HttpClient) { }

  createOffer(offer: Offer, companyName: string | null): Observable<any> {
    if (!companyName) {
      throw new Error('Company name is required');
    }

    const payload = {
      ...offer,
      companyName: companyName
    };


    return this.http.post(`${this.baseUrl}`, payload);
  }
}

