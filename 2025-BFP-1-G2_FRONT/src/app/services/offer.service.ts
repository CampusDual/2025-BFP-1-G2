import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, switchMap } from 'rxjs';
import { Candidate } from '../detailed-card/detailed-card.component';
import { Tag } from '../admin/admin-dashboard/admin-dashboard.component';
import { environment } from '../../environments/environment';

export interface CompanyOffer {
  id?: number;
  title: string;
  description: string;
  location?: string;
  dateAdded?: Date;
  dateToString?: string;
  tags?: Tag[];
  isActive?: boolean;
  companyId?: number;
  candidates?: Candidate[];
  logo?: string;
  status?: string;
}


export interface CandidateOffer {
  id?: number;
  title: string;
  description: string;
  location?: string;
  dateAdded?: Date;
  dateToString?: string;
  tags?: Tag[];
  valid?: Boolean;
  companyId?: number;
  companyName?: string;
  email?: string;
  candidateValid?: boolean;
  isValid?: 'VALID' | 'INVALID' | 'PENDING' | null;
  applied?: boolean;
  logo?: string;
  isBookmarked?: boolean; 
  status?: string;
}

export interface Offer {
  id?: number;
  title: string;
  description: string;
  location?: string;
  dateAdded?: Date;
  dateToString?: string;
  tags?: Tag[];
  valid?: Boolean;
  companyId?: number;
  companyName?: string;
  email?: string;
  logo?: string;
  status?: string;
}

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private baseUrl = `${environment.apiUrl}/offer`;

  constructor(private http: HttpClient) { }


  createOffer(offer: Offer): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, offer, { responseType: 'text' });
  }

  getOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.baseUrl}/getAll`);
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
  getCandidateOffers(): Observable<CandidateOffer[]> {
    return this.http.get<CandidateOffer[]>(`${this.baseUrl}/myOffers`);
  }

  addBookmark(offerId: number): Observable<string> {
    return this.http.post(`${this.baseUrl}/bookmark/${offerId}`, {}, { responseType: 'text' });
  }

  removeBookmark(offerId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/bookmark/${offerId}`, { responseType: 'text' });
  }

  getUserBookmarksOffers(): Observable<Offer[]> {
    return this.http.get<Offer[]>(`${this.baseUrl}/bookmarks`);
  }

  isBookmarked(offerId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/bookmark/check/${offerId}`);
  }
}
