import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, map, Observable, tap, of, catchError, shareReplay, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Candidate } from 'src/app/detailed-card/detailed-card.component';
import { Tag } from 'src/app/admin/admin-dashboard/admin-dashboard.component';
import { Company } from 'src/app/services/company.service';

export interface User {
  id: number;
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
  tags?: Tag[];
}

export interface DecodedToken {
  sub: string;
  roles: string[];
  exp: number;
  iat: number;
}



@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/auth`;
  
  private authStatusSubject = new BehaviorSubject<boolean>(this.isLoggedIn());
  public isAuthenticated$ = this.authStatusSubject.asObservable();
  
  private userNameSubject = new BehaviorSubject<string>(this.getLogin());
  public userName$ = this.userNameSubject.asObservable();
  
  private rolesCache: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  public roles$ = this.rolesCache.asObservable();
  
  private candidateDetailsCache: Observable<Candidate> | null = null;
  private companyDetailsCache: Observable<any> | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    console.log('AuthService: Initializing...');
    
    // Verificar y cargar roles al inicializar si hay un token válido
    if (this.isLoggedIn()) {
      console.log('AuthService: Token found on initialization, loading user roles...');
      this.loadUserRoles().subscribe({
        next: (roles) => {
          console.log('AuthService: Roles loaded on initialization:', roles);
        },
        error: (error) => {
          console.error('AuthService: Failed to load roles on initialization:', error);
          if (error.status === 401 || error.status === 403) {
            console.log('AuthService: Token invalid, clearing auth state');
            this.clearAuthState();
          }
        }
      });
    } else {
      console.log('AuthService: No valid token found on initialization');
    }
  }


  private loadUserRoles(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/user/roles`).pipe(
      tap(roles => {
        console.log('Roles loaded from server:', roles);
        this.rolesCache.next(roles);
      }),
      catchError(error => {
        console.error('Error loading user roles:', error);
        this.rolesCache.next([]);
        return of([]);
      }),
      shareReplay(1)
    );
  }

  hasRoles(expectedRoles: string[]): Observable<boolean> {
    return this.roles$.pipe(
      map(roles => roles.some(role => expectedRoles.includes(role)))
    );
  }


  hasRole(expectedRole: string): Observable<boolean> {
    return this.roles$.pipe(
      map(roles => roles.includes(expectedRole))
    );
  }

  getRolesCached(): string[] {
    return this.rolesCache.value;
  }
  
  hasRoleCached(role: string): boolean {
    return this.getRolesCached().includes(role);
  }

  login(credentials: { login: string, password: string }): Observable<any> {
    console.log('Attempting login for user:', credentials.login);
    
    this.clearAuthState();
    
    const basicAuth = btoa(`${credentials.login}:${credentials.password}`);
    const headers = { Authorization: `Basic ${basicAuth}` };
    
    return this.http.post(`${this.baseUrl}/signin`, {}, { headers, responseType: 'text' }).pipe(
      tap({
        next: (token: string) => {
          console.log('Login successful, processing token...');
          this.setAuthToken(token);
        },
        error: (error) => {
          console.error('Login failed:', error);
          this.clearAuthState();
        }
      }),
      switchMap((token: string) => {
        return this.loadUserRoles().pipe(
          map(() => token)
        );
      })
    );
  }


  private setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.authStatusSubject.next(true);
    
    const username = this.getLogin();
    console.log('Username extracted from token:', username);
    this.userNameSubject.next(username);
  }


  private clearAuthState(): void {
    localStorage.removeItem('authToken');
    this.authStatusSubject.next(false);
    this.userNameSubject.next('');
    this.rolesCache.next([]);
    this.candidateDetailsCache = null;
    this.companyDetailsCache = null;
  }

  register(userData: any): Observable<any> {
    this.clearAuthState();

    const completeUserData = {
      login: userData.login,
      password: userData.password,
      email: userData.email,
      name: userData.name,
      surname1: userData.surname1,
      surname2: userData.surname2,
      phoneNumber: userData.phoneNumber,
      location: userData.location || null,
      professionalTitle: userData.professionalTitle || null,
      yearsOfExperience: userData.yearsOfExperience || null,
      educationLevel: userData.educationLevel || null,
      languages: userData.languages || null,
      employmentStatus: userData.employmentStatus || null,
      profilePictureUrl: userData.profilePhoto || null,
      curriculumUrl: userData.curriculum || null,
      linkedinUrl: userData.linkedin || null,
      githubUrl: userData.github || null,
      figmaUrl: userData.figma || null,
      personalWebsiteUrl: userData.personalWebsite || null,
      tagIds: userData.tagIds || []
    };

    console.log('Registering user with complete data:', completeUserData);

    return this.http.post(`${this.baseUrl}/signup`, completeUserData, { responseType: 'text' }).pipe(
      tap({
        next: (response: any) => {
          console.log('Usuario registrado exitosamente:', response);
        },
        error: (error) => {
          console.error('Error en el registro:', error);
        }
      })
    );
  }


  isLoggedIn(): boolean {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return false;
    }

    try {
      const payload = this.decodeToken(token);
      const isExpired = payload.exp < Date.now() / 1000;
      
      if (isExpired) {
        console.log('Token expired, clearing auth state');
        this.clearAuthState();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error validating token:', error);
      this.clearAuthState();
      return false;
    }
  }

  private decodeToken(token: string): DecodedToken {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload;
    } catch (error) {
      throw new Error('Invalid token format');
    }
  }

  logout(): void {
    console.log('Logging out user');
    this.clearAuthState();
    this.router.navigate(['/auth/login']);
  }

  getCandidateDetails(): Observable<Candidate> {
    if (!this.candidateDetailsCache) {
      this.candidateDetailsCache = this.http.get<Candidate>(`${this.baseUrl}/candidateDetails`).pipe(
        shareReplay(1)
      );
    }
    return this.candidateDetailsCache;
  }

  getSpecificCandidateDetails(username: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.baseUrl}/candidateDetails/${username}`);
  }

  updateCandidateDetails(candidateData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/candidateDetails/edit`, candidateData).pipe(
      tap(() => {
        this.candidateDetailsCache = null;
      })
    );
  }


  getCompanyDetails(): Observable<Company> {
    if (!this.companyDetailsCache) {
      this.companyDetailsCache = this.http.get<Company>(`${this.baseUrl}/companyDetails`).pipe(
        shareReplay(1) 
      );
    }
    return this.companyDetailsCache;
  }
  isCandidate(): Observable<boolean> {
    return this.hasRole('ROLE_CANDIDATE');
  }

  isCompany(): Observable<boolean> {
    return this.hasRole('ROLE_COMPANY');
  }

  isAdmin(): Observable<boolean> {
    return this.hasRole('ROLE_ADMIN');
  }

  isCandidateCached(): boolean {
    return this.hasRoleCached('ROLE_CANDIDATE');
  }

  isCompanyCached(): boolean {
    return this.hasRoleCached('ROLE_COMPANY');
  }

  isAdminCached(): boolean {
    return this.hasRoleCached('ROLE_ADMIN');
  }

  getLogin(): string {
    const token = localStorage.getItem('authToken');
    if (!token) {
      return '';
    }

    try {
      const payload = this.decodeToken(token);
      return payload.sub || '';
    } catch (error) {
      console.error('Error extracting username from token:', error);
      return '';
    }
  }

  redirectToUserHome(): void {
    const roles = this.getRolesCached();
    if (roles.includes('ROLE_CANDIDATE')) {
      console.log('Redirecting to candidate portal');
      this.router.navigate(['/offers/portal']);
    } else if (roles.includes('ROLE_COMPANY')) {
      console.log('Redirecting to company panel');
      this.router.navigate(['/company/myoffers']);
    } else if (roles.includes('ROLE_ADMIN')) {
      console.log('Redirecting to admin panel');
      this.router.navigate(['/admin/dashboard']);
    } else {
      console.log('No specific role found, redirecting to default');
      this.router.navigate(['/offers/portal']);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = this.decodeToken(token);
      const fiveMinutesFromNow = (Date.now() / 1000) + (5 * 60);
      return payload.exp < fiveMinutesFromNow;
    } catch {
      return true;
    }
  }

  ensureRolesLoaded(): Observable<string[]> {
    const currentRoles = this.getRolesCached();
    
    // Si ya tenemos roles en caché, devolverlos inmediatamente
    if (currentRoles.length > 0) {
      console.log('AuthService: Roles already cached:', currentRoles);
      return of(currentRoles);
    }
    
    // Si no está logueado, devolver array vacío
    if (!this.isLoggedIn()) {
      console.log('AuthService: User not logged in, returning empty roles');
      return of([]);
    }
    
    // Intentar obtener roles del servidor, pero primero esperar un poco
    // por si ya hay una petición en curso desde la inicialización
    console.log('AuthService: No roles cached, attempting to load from server...');
    
    return new Observable<string[]>(observer => {
      // Esperar brevemente por si los roles se están cargando
      const checkInterval = setInterval(() => {
        const cachedRoles = this.getRolesCached();
        if (cachedRoles.length > 0) {
          clearInterval(checkInterval);
          observer.next(cachedRoles);
          observer.complete();
        }
      }, 100);
      
      // Si después de 1 segundo no hay roles, hacer petición al servidor
      setTimeout(() => {
        const stillNoCached = this.getRolesCached();
        if (stillNoCached.length === 0) {
          clearInterval(checkInterval);
          
          this.loadUserRoles().subscribe({
            next: (roles) => {
              observer.next(roles);
              observer.complete();
            },
            error: (error) => {
              console.error('AuthService: Error loading roles in ensureRolesLoaded:', error);
              observer.next([]);
              observer.complete();
            }
          });
        }
      }, 1000);
      
      // Timeout total después de 6 segundos
      setTimeout(() => {
        clearInterval(checkInterval);
        if (!observer.closed) {
          console.warn('AuthService: Timeout loading roles, returning cached or empty');
          observer.next(this.getRolesCached());
          observer.complete();
        }
      }, 6000);
    });
  }

  deleteExperience(experienceId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/candidateDetails/experience/${experienceId}`);
}

createExperience(experience: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/candidateDetails/experience`, experience);
}

deleteEducation(educationId: number): Observable<any> {
  return this.http.delete(`${this.baseUrl}/candidateDetails/education/${educationId}`);
}

createEducation(education: any): Observable<any> {
  return this.http.post(`${this.baseUrl}/candidateDetails/education`, education);
}
}

