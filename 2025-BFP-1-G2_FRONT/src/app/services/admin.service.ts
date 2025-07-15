import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Candidate} from "../detailed-card/detailed-card.component";
import { environment } from '../../environments/environment';

export interface MonthlyClosedOffersDTO {
  month: number;
  year: number;
  count: number;
}



@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient) { }

  getCandidatesOffers(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.baseUrl}/listCandidates`);
  }

    getMonthlyClosedOffers(): Observable<{ month: number, year: number, count: number }[]> {
    return this.http.get<{ month: number, year: number, count: number }[]>(`${this.baseUrl}/metrics/monthly-closed-offers`);
  }

  getMonthlyAcceptedCandidates(): Observable<MonthlyClosedOffersDTO[]> {
    return this.http.get<MonthlyClosedOffersDTO[]>(`${environment.apiUrl}/offer/metrics/monthly-closed-offers`);
  }
}
