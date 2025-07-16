import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MonthlyCountDTO } from '../models/metrics.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = `${environment.apiUrl}/auth`;

  constructor(private http: HttpClient) { }

  getCandidatesOffers(): Observable<MonthlyCountDTO[]> {
    return this.http.get<MonthlyCountDTO[]>(`${this.baseUrl}/listCandidates`);
  }

  getMonthlyClosedOffers(): Observable<{ month: number, year: number, count: number }[]> {
    return this.http.get<{ month: number, year: number, count: number }[]>(`${this.baseUrl}/metrics/monthly-closed-offers`);
  }

  getMonthlyAcceptedCandidates(): Observable<MonthlyCountDTO[]> {
    return this.http.get<MonthlyCountDTO[]>(`${environment.apiUrl}/offer/metrics/monthly-closed-offers`);
  }
}
