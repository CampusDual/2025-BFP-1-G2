import { Injectable } from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import { AuthService } from './services/auth.service';


@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate{
  constructor(private auth: AuthService, private router: Router) {}


  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']).then(r => {});
      return false;
    }

    const expectedRoles = route.data['roles'] as string[];
    if (expectedRoles && !this.auth.hasRole(expectedRoles)) {
      console.warn('Acceso denegado. Usuario no tiene los roles necesarios:', expectedRoles);
      console.warn('Roles del usuario:', this.auth.getRoles());
      this.router.navigate(['/no-autorizado']).then(r => {});
      return false;
    }

    return true;
  }



}
