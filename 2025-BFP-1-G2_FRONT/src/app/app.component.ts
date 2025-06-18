import { Component } from '@angular/core';
import { animate, style, transition, trigger } from "@angular/animations";
import { RouterOutlet } from "@angular/router";
import { AuthService } from './auth/services/auth.service';

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

export class AppComponent {
  showFiller = false;
  isCompany = false;
  isCandidate = false;

  constructor (protected authService: AuthService) {
    this.loadUserRole();
  }

  loadUserRole() {
    this.authService.hasRole('ROLE_COMPANY').subscribe({
      next: (hasRole) => {
        this.isCompany = hasRole;
      }
    });

    this.authService.hasRole('ROLE_CANDIDATE').subscribe({
      next: (hasRole) => {
        this.isCandidate = hasRole;
      }
    });
  }

  getRouterOutletState(outlet: RouterOutlet)
   {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
