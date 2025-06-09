import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, tap} from 'rxjs';

interface User {
  username: string;
  password: string;
  authorities: any[];
  accountNonExpired: boolean;
  accountNonLocked: boolean;
  credentialsNonExpired: boolean;
  enabled: boolean;
}

@Injectable({
  providedIn: 'root'
})


export class AuthService {
  private baseUrl = 'http://localhost:30030/auth';
  username: string | null = null;


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

  register(userData: { login: string, password: string, email: string }): Observable<any> {
    // borrar token si existe
    localStorage.removeItem('authToken');
    return this.http.post(`${this.baseUrl}/signup`, userData, {responseType: 'text'});
  }

  isLoggedIn(): boolean {
    // Verifica si hay un token de autenticación en el almacenamiento local
    //Y tambien si el token no ha expirado
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
      const token = this.getToken();
      if (!token) {
      return new Observable(observer => {
        observer.error('No hay token disponible');
      });
    }
    const headers = {Authorization: `Bearer ${token}`};
    return this.http.get<User>(`${this.baseUrl}/me`, {headers});
  }

  getUserName(): Observable<string> {
    return this.getUser().pipe(
      map(user => user.username),
      tap(username => {
        this.username = username;
        console.log('Username retrieved:', username);
      })
    );
  }

  getUsername(): string | null {
    return this.username;
  }


}
