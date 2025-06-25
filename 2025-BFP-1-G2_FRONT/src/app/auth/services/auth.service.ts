import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

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
  date: string;
}

@Injectable({
  providedIn: 'root'
})


export class AuthService {


  private baseUrl = 'http://localhost:30030/auth';
  private authStatusSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isAuthenticated$ = this.authStatusSubject.asObservable();
  private userNameSubject = new BehaviorSubject<string>(this.getLogin());
  public userName$ = this.userNameSubject.asObservable();


  hasRoles(expectedRoles: string[]): Observable<boolean> {
    return this.http.get<string[]>(`${this.baseUrl}/user/roles`).pipe(
      map(roles => roles.some(role => expectedRoles.includes(role)))
    );
  }

  hasRole(expectedRole: string): Observable<boolean> {
    return this.http.get<string[]>(`${this.baseUrl}/user/roles`).pipe(
      map(roles => roles.includes(expectedRole))
    );
  }

  constructor(private http: HttpClient,
    private router: Router
  ) {
  }

  login(credentials: { login: string, password: string }): Observable<any> {
    localStorage.removeItem('authToken');
    const basicAuth = btoa(`${credentials.login}:${credentials.password}`);
    const headers = { Authorization: `Basic ${basicAuth}` };
    return this.http.post(`${this.baseUrl}/signin`, {}, { headers, responseType: 'text' }).pipe(
      tap({
        next: (token: any) => {
          this.authStatusSubject.next(true);
          localStorage.setItem('authToken', token);
          this.userNameSubject.next(this.getLogin());

        },
        error: () => {
          this.authStatusSubject.next(false);
          this.userNameSubject.next('');
        }
      })
    );
  }

  register(userData: {
    login: string, password: string, email: string, name: string,
    surname1: string, surname2: string, phoneNumber: string
  }): Observable<any> {
    localStorage.removeItem('authToken');
    console.log('Registering user with data:', userData);
    return this.http.post(`${this.baseUrl}/signup`, userData, { responseType: 'text' });
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
    this.userNameSubject.next('');
  }

  getCandidateDetails(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/candidateDetails`);
  }

  isCandidate() {
    return this.hasRole('ROLE_CANDIDATE');
  }
  isCompany() {
    return this.hasRole('ROLE_COMPANY');
  }

  getLogin(): string {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return '';
    }
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || '';
  }

  redirectToUserHome() {
    this.hasRole('ROLE_CANDIDATE').subscribe({
      next: (isCandidate) => {
        if (isCandidate) {
          this.router.navigate([`../offers/portal`]);
          return;
        }
        this.hasRole('ROLE_COMPANY').subscribe({
          next: (isCompany) => {
            if (isCompany) {
              console.log("Redirecting to company panel");
              this.router.navigate([`../company/myoffers`]);
              return;
            }

            this.hasRole('ROLE_ADMIN').subscribe({
              next: (isAdmin) => {
                if (isAdmin) {
                  this.router.navigate([`../admin`]);
                } else {
                  this.router.navigate([`../offers/portal`]);
                }
              }
            });
          }
        });
      }
    });
  }

}
