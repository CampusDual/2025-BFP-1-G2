import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet, NavigationEnd, Router } from "@angular/router";
import { AuthService } from './auth/services/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
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
    this.authService.hasRole('ROLE_COMPANY').subscribe({
      next: (hasRole) => {
        if (hasRole) {
          this.companyService.getMyCompany().subscribe({
            next: (company) => {
              this.companyName = company.name;
            },
            error: (error) => {
              console.error('Error fetching company details:', error);
              this.companyName = '';
            }
          });
        } else {
          this.companyName = '';
        }
        this.isCompany = hasRole;
      },
      error: (error) => {
        console.error('Error checking company role:', error);
        this.isCompany = false;
        this.companyName = '';
      }
    });

    this.authService.hasRole('ROLE_CANDIDATE').subscribe({
      next: (hasRole) => {
        if (hasRole) {
          this.userName = this.authService.getLogin() || '';
          console.log('User name loaded for navigation:', this.userName);
        } else {
          this.userName = '';
        }
        this.isCandidate = hasRole;
      },
      error: (error) => {
        console.error('Error checking candidate role:', error);
        this.isCandidate = false;
        this.userName = '';
      }
    });
    
    this.authService.hasRole('ROLE_ADMIN').subscribe({
      next: (hasRole) => {
        if (hasRole) {
          this.userName = this.authService.getLogin() || '';
        }
        this.isAdmin = hasRole;
      },
      error: (error) => {
        console.error('Error checking admin role:', error);
        this.isAdmin = false;
      }
    });
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
