import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegisterComponent } from './register/register.component';
import {LoginComponent} from "./login/login.component";
import {CompanyPanelComponent} from "../company-panel/company-panel.component";


const routes: Routes = [
  {path: 'register', component: RegisterComponent},
  {path: 'login',component: LoginComponent},
  {path: 'company/:companyName',component: CompanyPanelComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
