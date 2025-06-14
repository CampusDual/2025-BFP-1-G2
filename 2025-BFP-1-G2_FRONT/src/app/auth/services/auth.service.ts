import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, tap} from 'rxjs';

export interface User {
  username: string;
  password: string;
  authorities: any[];
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  enabled: boolean;
  name: string;
  surname1: string;
  surname2: string;
  email: string;
  phoneNumber: string;
}

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  private baseUrl = 'http://localhost:30030/auth';

  hasRole(expectedRoles: string[]): Observable<boolean> {
    return this.http.get<string[]>(`${this.baseUrl}/user/roles`).pipe(
        map(roles => roles.some(role => expectedRoles.includes(role)))
    );
  }

  constructor(private http: HttpClient) {
  }

  login(credentials: { login: string, password: string }): Observable<any> {
    localStorage.removeItem('authToken');
    const basicAuth = btoa(`${credentials.login}:${credentials.password}`);
    const headers = {Authorization: `Basic ${basicAuth}`};
    return this.http.post(`${this.baseUrl}/signin`, {}, {headers, responseType: 'text'})
      .pipe(
        tap(token => localStorage.setItem('authToken', token))
      );
  }

  register(userData: {
    login: string, password: string, email: string, name: string,
    surname1: string, surname2: string, phoneNumber: string
  }): Observable<any> {
    localStorage.removeItem('authToken');
    console.log('Registering user with data:', userData);
    return this.http.post(`${this.baseUrl}/signup`, userData, {responseType: 'text'});
  }

  isLoggedIn(): boolean {
    if (!localStorage.getItem('authToken')) {
      return false;
    }
    const token = localStorage.getItem('authToken');
    if (!token) {
      return false;
    }

    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp < Date.now() / 1000;
    return !isExpired;

  }

  logout(): void {
    localStorage.removeItem('authToken');
  }

  getCandidateDetails(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/candidateDetails`);
  }


}
