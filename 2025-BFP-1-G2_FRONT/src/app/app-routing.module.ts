import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./auth/auth.guard";

const routes: Routes = [
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  {
    path: 'offers', 
    loadChildren: () => import('./offer-panel/offer-panel.module').then(m => m.OfferPanelModule),
    data: { roles: ['ROLE_CANDIDATE', 'ROLE_ADMIN'] },
    canActivate: [AuthGuard]
  },
  {
    path: 'company',
    loadChildren: () => import('./company/company.module').then(m => m.CompanyModule)
  },
  {
    path: 'user',  
    loadChildren: () => import('./user/user.module').then(m => m.UserModule), 
    data: { roles: ['ROLE_CANDIDATE', 'ROLE_COMPANY'] },
    canActivate: [AuthGuard]
  },
  {
    path:'admin',
    loadChildren:() => import('./admin/admin.module').then(m=>m.AdminModule),
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_ADMIN'] }
  },
  {path: '', redirectTo: 'offers/portal', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}