import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./auth/auth.guard";
import { UserPanelComponent } from './user-panel/user-panel.component';

const routes: Routes = [
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  {path: 'offers', loadChildren: () => import('./offer-panel/offer-panel.module').then(m => m.OfferPanelModule)},

  {
    path: 'company', 
    loadChildren: () => import('./company/company.module').then(m => m.CompanyModule), 
    canActivate: [AuthGuard], data: { roles: ['ROLE_COMPANY'] }
  },
  {path: '', redirectTo: 'offers/portal', pathMatch: 'full' },
  {path: 'user', component: UserPanelComponent, canActivate: [AuthGuard], data: { roles: ['ROLE_CANDIDATE'] } },

  {path:'admin', loadChildren:() => import('./admin/admin.module').then(m=>m.AdminModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
