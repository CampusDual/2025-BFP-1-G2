import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, UrlTree} from '@angular/router';
import {AuthService} from './services/auth.service';
import {Observable, of, timer} from 'rxjs';
import {map, catchError, timeout, switchMap, take, takeUntil} from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {
    constructor(private auth: AuthService, private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        console.log('AuthGuard: Checking route:', route.routeConfig?.path);
        
        // Permitir acceso a rutas de ofertas sin autenticación (acceso público)
        if (route.routeConfig?.path === 'offers') {
            console.log('AuthGuard: Allowing public access to offers route');
            return true;
        }
        
        // Si no está logueado, redirigir a login
        if (!this.auth.isLoggedIn()) {
            console.log('AuthGuard: User not logged in, redirecting to login');
            this.router.navigate(['/auth/login']);
            return false;
        }

        const expectedRoles = route.data['roles'] as string[];
        
        // Si no se requieren roles específicos, permitir acceso
        if (!expectedRoles || expectedRoles.length === 0) {
            console.log('AuthGuard: No specific roles required, allowing access');
            return true;
        }

        console.log('AuthGuard: Checking roles for route access:', expectedRoles);
        
        // Usar ensureRolesLoaded para garantizar que los roles están cargados
        return this.auth.ensureRolesLoaded().pipe(
            switchMap((roles) => {
                console.log('AuthGuard: Roles loaded:', roles);
                
                // Si no hay roles después de cargar, denegar acceso
                if (roles.length === 0) {
                    console.log('AuthGuard: No roles found after loading, denying access');
                    this.router.navigate(['/auth/login']);
                    return of(false);
                }
                
                // Verificar si el usuario tiene los roles requeridos
                const hasRequiredRole = roles.some(role => expectedRoles.includes(role));
                
                if (!hasRequiredRole) {
                    console.log('AuthGuard: Access denied, insufficient roles. User roles:', roles, 'Required:', expectedRoles);
                    this.router.navigate(['/auth/login']);
                    return of(false);
                }
                
                console.log('AuthGuard: Access granted, user has required roles');
                return of(true);
            }),
            timeout(8000), // Timeout más largo para la carga inicial
            catchError((error) => {
                console.error('AuthGuard: Error in role verification:', error);
                
                // En caso de timeout o error, verificar si está logueado como fallback
                if (this.auth.isLoggedIn()) {
                    console.log('AuthGuard: Role check failed but user is logged in, allowing access as fallback');
                    return of(true);
                } else {
                    console.log('AuthGuard: Role check failed and user not logged in, denying access');
                    this.router.navigate(['/auth/login']);
                    return of(false);
                }
            })
        );
    }
}
