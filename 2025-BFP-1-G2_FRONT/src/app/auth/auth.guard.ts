import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthService} from './services/auth.service';


@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (route.routeConfig?.path === 'offers' && !this.auth.isLoggedIn()) {
            return true;
        }
        else if(!this.auth.isLoggedIn()) {
            this.router.navigate(['/login']);
            return false;
        }
        const expectedRoles = route.data['roles'] as string[];
        if (!expectedRoles || expectedRoles.length === 0) {
            return true;
        }
        this.auth.redirectToUserHome();
        return true;
    }
}
