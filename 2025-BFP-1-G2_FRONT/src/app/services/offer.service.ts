import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from '../models/candidate.model';
import { environment } from '../../environments/environment';
import { MonthlyCountDTO } from '../models/metrics.model';
import { PageResponse } from '../models/page-response.model';
import { Offer } from '../models/offer.model';

@Injectable({
  providedIn: 'root'
})
export class OfferService {

  private baseUrl = `${environment.apiUrl}/offer`;

  constructor(private http: HttpClient) { }

  createOffer(offer: Offer): Observable<any> {
    return this.http.post(`${this.baseUrl}/add`, offer, { responseType: 'text' });
  }

  getMetricsOffer(): Observable<MonthlyCountDTO[]> {
    return this.http.get<MonthlyCountDTO[]>(`${this.baseUrl}/getAll`);
  }

  getOffers(searchTerm: string, tagIds: number[], page: number, size: number): Observable<PageResponse<Offer>> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('tagIds', tagIds.join(','))
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Offer>>(`${this.baseUrl}/getAll/paginated`, { params });
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

  getBookmarkedOffersCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/candidate?listType=bookmarks`);
  }
  getAppliedOffersCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/candidate?listType=applied`);

  }
  getRecommendedOffersCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/candidate?listType=recommended`);
  }
  getAllOffersCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count/candidate?listType=all`);
  }

  getCompanyOffers(status: string, searchTerm: string, tagIds: number[], page: number, size: number): Observable<PageResponse<Offer>> {
    const params = new HttpParams()
      .set('status', status)
      .set('searchTerm', searchTerm)
      .set('tagIds', tagIds.join(','))
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Offer>>(`${this.baseUrl}/company`, { params });
  }

   getCompanyOffersCount(status: string): Observable<number> {
    const params = new HttpParams()
      .set('status', status)
    return this.http.get<number>(`${this.baseUrl}/count/company`, { params });
  }

  getCandidateOffers(searchTerm: string, tagIds: number[], listType: string, page: number, size: number): Observable<PageResponse<Offer>> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('tagIds', tagIds.join(','))
      .set('listType', listType)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageResponse<Offer>>(`${this.baseUrl}/candidate`, { params });
  }

  addBookmark(offerId: number): Observable<string> {
    return this.http.post(`${this.baseUrl}/bookmark/${offerId}`, {}, { responseType: 'text' });
  }

  removeBookmark(offerId: number): Observable<string> {
    return this.http.delete(`${this.baseUrl}/bookmark/${offerId}`, { responseType: 'text' });
  }

  updateOfferStatus(offerId: number, status: string): Observable<string> {
    const params = new HttpParams().set('status', status);
    return this.http.put(`${this.baseUrl}/status/${offerId}`, null, { params, responseType: 'text' });
  }

getAverageHiringTime() {
  return this.http.get<number>(`${this.baseUrl}/company/average-hiring-time`);
}

}
