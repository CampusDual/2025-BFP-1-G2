import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import {LoginComponent} from "./login/login.component";
import {CompanyPanelComponent} from "../company-panel/company-panel.component";
import {CompanyLoginComponent} from "./company-login/company-login.component";


const routes: Routes = [
  { path: 'register', component: RegisterComponent, data: { animation: 'RegisterPage' } },
  { path: 'login', component: LoginComponent, data: { animation: 'LoginPage' } },
  { path: 'company/:companyName', component: CompanyPanelComponent, data: { animation: 'CompanyPage' } },
  { path: 'company-login', component: CompanyLoginComponent, data: { animation: 'CompanyLoginPage' } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
