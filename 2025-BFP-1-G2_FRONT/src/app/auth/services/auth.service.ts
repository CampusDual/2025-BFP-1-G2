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
  username: string | null = null;

  getRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/user/roles`);
  }


  hasRole(expectedRoles: string[]): boolean {
    return expectedRoles.some(role => this.getRoles().pipe(
      map(roles => expectedRoles.some(role => roles.includes(role)))
    ));
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

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  getUser(): Observable<User> {

    return this.http.get<User>(`${this.baseUrl}/me`);
  }

  getCandidateDetails(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/candidateDetails`);
  }

  getUserData(): User {
    let user: User | null = null;
    this.getUser().subscribe({
      next: (data: User) => {
        user = data;
      },
      error: (err) => {
        console.error('Error fetching user data:', err);
      }
    });
    return user || {username: '', password: '', authorities: [], accountNonExpired: true, accountNonLocked: true, credentialsNonExpired: true, enabled: true, name: '', surname1: '', surname2: '', email: '', phoneNumber: ''};
  }

  getUserName(): Observable<string> {
    return this.getUser().pipe(
      map(user => user.username),
      tap(username => {
        this.username = username;
      })
    );
  }

}
