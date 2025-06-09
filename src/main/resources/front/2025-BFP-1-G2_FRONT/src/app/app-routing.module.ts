import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import {CompanyPanelComponent} from "./company-panel/company-panel.component";
import {AuthGuard} from "./auth/auth.guard";


//canActivate
const routes: Routes = [
  { path: 'auth', loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule) },
  { path: '', redirectTo: 'register', pathMatch: 'full' },
  { path: 'register',  component: RegisterComponent },
  { path: 'login',  component: LoginComponent },
  { path: 'company/:companyName', component: CompanyPanelComponent, canActivate: [AuthGuard] },
  { path: 'offer-panel', loadChildren: () => import('./offer-panel/offer-panel.module').then(m => m.OfferPanelModule) },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
