import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, NavigationEnd, Router } from "@angular/router";
import { AuthService } from './auth/services/auth.service';
import { Subscription } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { CompanyService } from './services/company.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})

export class AppComponent implements OnInit, OnDestroy {
  showFiller = false;
  isCompany = false;
  isCandidate = false;
  isAdmin = false;
  showHeader = true;
  showFooter = true;
  userName?: string;
  companyName?: string;
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    protected authService: AuthService,
    private router: Router,
    private companyService: CompanyService 
  ) { }

  ngOnInit() {
    this.authSubscription = this.authService.isAuthenticated$.subscribe({
      next: (isAuthenticated) => {
        if (isAuthenticated) {
          this.loadUserRole();
        } else {
          this.isCompany = false;
          this.isCandidate = false;
          this.isAdmin = false;
          this.userName = '';
          this.companyName = '';
        }
      }
    });

    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.checkAuthStatus();
        const url = (event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url;
        const isLoginOrRegister = url.includes('/login') || url === '/auth/login' || url === '/login' || url.includes('/register') || url === '/auth/register' || url === '/register';
        this.showHeader = !isLoginOrRegister;
        this.showFooter = !isLoginOrRegister;
      });

    this.checkAuthStatus();
    const initialUrl = this.router.url;
    const isLoginOrRegister = initialUrl.includes('/login') || initialUrl === '/auth/login' || initialUrl === '/login' || initialUrl.includes('/register') || initialUrl === '/auth/register' || initialUrl === '/register';
    this.showHeader = !isLoginOrRegister;
    this.showFooter = !isLoginOrRegister;
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  checkAuthStatus() {
    const isAuth = this.authService.isLoggedIn();
    if (isAuth) {
      this.loadUserRole();
    } else {
      this.isCompany = false;
      this.isCandidate = false;
      this.isAdmin = false;
      this.userName = '';
      this.companyName = '';
    }
  }

  loadUserRole() {
    // Usar métodos cached para verificación rápida si hay roles disponibles
    const cachedRoles = this.authService.getRolesCached();
    
    if (cachedRoles.length > 0) {
      // Usar roles cached para asignación inmediata
      this.updateRoleFlags(cachedRoles);
      this.loadUserData();
    } else {
      // Si no hay roles cached, suscribirse a la carga de roles
      this.authService.roles$.subscribe(roles => {
        if (roles.length > 0) {
          this.updateRoleFlags(roles);
          this.loadUserData();
        }
      });
    }
  }

  private updateRoleFlags(roles: string[]) {
    this.isCompany = roles.includes('ROLE_COMPANY');
    this.isCandidate = roles.includes('ROLE_CANDIDATE');
    this.isAdmin = roles.includes('ROLE_ADMIN');
  }

  private loadUserData() {
    if (this.isCompany) {
      this.companyService.getMyCompany().subscribe({
        next: (company) => {
          this.companyName = company.name;
          console.log('Company name loaded for navigation:', this.companyName);
        },
        error: (error) => {
          console.error('Error fetching company details:', error);
          this.companyName = '';
        }
      });
    } else {
      this.companyName = '';
    }

    if (this.isCandidate || this.isAdmin) {
      this.userName = this.authService.getLogin();
      console.log('User name loaded for navigation:', this.userName);
    } else {
      this.userName = '';
    }
  }
  navigateToAddOffer() {
    if (this.router.url.includes('/company/myoffers')) {
      this.router.navigate(['/company/myoffers'], {
        queryParams: { addNew: true, timestamp: Date.now() }
      });
    } else {
      this.router.navigate(['/company/myoffers'], {
        queryParams: { addNew: true }
      });
    }
  }

  getRouterOutletState(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
