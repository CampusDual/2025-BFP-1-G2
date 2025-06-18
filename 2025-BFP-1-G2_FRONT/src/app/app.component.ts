import { Component, OnInit, OnDestroy } from '@angular/core';
import { animate, style, transition, trigger } from "@angular/animations";
import { RouterOutlet, NavigationEnd, Router } from "@angular/router";
import { AuthService } from './auth/services/auth.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('fadeAnimation', [
      transition('* <=> *', [
        style({ opacity: 0, transform: 'translateY(20px)', filter: 'blur(2px)' }),
        animate('400ms', style({ opacity: 1, transform: 'translateY(0px)', filter: 'blur(0px)' })),
      ])
    ]),
  ]
})

export class AppComponent implements OnInit, OnDestroy {

  showFiller = false;
  isCompany = false;
  isCandidate = false;
  private authSubscription?: Subscription;
  private routerSubscription?: Subscription;

  constructor(
    protected authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    // Escuchar cambios en el estado de autenticación
    this.authSubscription = this.authService.isAuthenticated$.subscribe({
      next: (isAuthenticated) => {
        console.log('Auth status changed:', isAuthenticated); // Debug
        if (isAuthenticated) {
          this.loadUserRole();
        } else {
          this.isCompany = false;
          this.isCandidate = false;
        }
      }
    });

    // También escuchar cambios de ruta para verificar el estado
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAuthStatus();
      });

    // Verificar estado inicial
    this.checkAuthStatus();
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
    console.log('Checking auth status:', isAuth);
    if (isAuth) {
      this.loadUserRole();
    } else {
      this.isCompany = false;
      this.isCandidate = false;
    }
  }

  loadUserRole() {
    console.log('Loading user roles...'); // Debug

    this.authService.hasRole('ROLE_COMPANY').subscribe({
      next: (hasRole) => {
        console.log('Is Company:', hasRole); // Debug
        this.isCompany = hasRole;
      },
      error: (error) => {
        console.error('Error checking company role:', error);
        this.isCompany = false;
      }
    });

    this.authService.hasRole('ROLE_CANDIDATE').subscribe({
      next: (hasRole) => {
        console.log('Is Candidate:', hasRole); // Debug
        this.isCandidate = hasRole;
      },
      error: (error) => {
        console.error('Error checking candidate role:', error);
        this.isCandidate = false;
      }
    });
  }

  getRouterOutletState(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
