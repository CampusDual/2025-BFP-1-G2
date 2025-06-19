import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {AuthService} from './services/auth.service';


@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (!this.auth.isLoggedIn()) {
            this.router.navigate(['/login'])
            return false;
        }
        const expectedRoles = route.data['roles'] as string[];
        if (!expectedRoles || expectedRoles.length === 0) {
            return true;
        }
        this.auth.hasRoles(expectedRoles).subscribe({
            next: (hasRole) => {
                if (!hasRole) {
                    this.router.navigate(['../offers/portal'])
                    return false;
                }
                return true;
            },
            error: (error) => {
                console.error('Error checking roles', error);
                this.router.navigate(['../offers/portal'])
                return false;
            }
        });
        return true;
    }
}
