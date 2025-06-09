import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, tap} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OfferService {
  private baseUrl = 'http://localhost:30030/offer';

  constructor(private http: HttpClient) {}

  createOffer(offerData: { title: string, description: string }): Observable<any> {

    return this.http.post(`${this.baseUrl}/signup`, userData, {responseType: 'text'});
  }
}
