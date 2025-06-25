import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import {AuthService} from './services/auth.service';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
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
        } else if (expectedRoles.length > 0) {
            return this.auth.hasRoles(expectedRoles).pipe(
                map((hasRole: boolean) => {
                    if (!hasRole) {
                        this.router.navigate(['/login']);
                        return false;
                    }
                    return true;
                })
            );
        }
        return true;
    }
}
