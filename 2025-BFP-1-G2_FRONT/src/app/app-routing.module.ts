import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {RegisterComponent} from './auth/register/register.component';
import {LoginComponent} from './auth/login/login.component';
import {CompanyPanelComponent} from "./company-panel/company-panel.component";
import {AuthGuard} from "./auth/auth.guard";
import {OfferTableComponent} from "./offer-panel/offer-table/offer-table.component";


//canActivate
const routes: Routes = [
  {path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)},
  {path: 'offer', loadChildren: () => import('./offer-panel/offer-panel.module').then(m => m.OfferPanelModule)},
  {path: '', redirectTo: 'offers/portal', pathMatch: 'full'},
  {path: 'register', component: RegisterComponent},
  {path: 'login', component: LoginComponent},
  {path: 'company/:companyName', component: CompanyPanelComponent, canActivate: [AuthGuard]},
  {path: 'offers/portal', component: OfferTableComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
