import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AuthGuard} from "./auth/auth.guard";
import { UserPanelComponent } from './user-panel/user-panel.component';
import {CompanyPanelComponent} from "./company-panel/company-panel.component";
import {CompanyLoginComponent} from "./auth/company-login/company-login.component";

const routes: Routes = [
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  {path: 'offers', loadChildren: () => import('./offer-panel/offer-panel.module').then(m => m.OfferPanelModule)},
  {path: '', redirectTo: 'offers/portal', pathMatch: 'full' },
  { path: 'company/login', component: CompanyLoginComponent},
  {path: 'user', component: UserPanelComponent, canActivate: [AuthGuard], data: { roles: ['ROLE_CANDIDATE'] } },
  {
    path: 'company/:companyName',
    component: CompanyPanelComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_COMPANY'] }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
