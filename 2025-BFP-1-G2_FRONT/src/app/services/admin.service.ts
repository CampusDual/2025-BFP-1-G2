import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {Candidate} from "../detailed-card/detailed-card.component";
import { environment } from '../../environments/environment';



@Injectable({
  providedIn: 'root'
})
export class AdminService {

  private baseUrl = `${environment.apiUrl}/auth`;

    constructor(private http: HttpClient) { }

  // Obtener candidatos (método que permanece en admin)
  getCandidatesOffers(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.baseUrl}/listCandidates`);
  }
}
