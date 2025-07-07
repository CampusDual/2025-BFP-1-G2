import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompaniesComponent } from './companies/companies.component';
import { UserPanelComponent } from './user-panel/user-panel.component';
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: 'profile', pathMatch: 'full' },
  {
    path: 'companies', component: CompaniesComponent,
    data: { roles: ['ROLE_CANDIDATE'] },
    canActivate: [AuthGuard]
  },
  {
    path: 'profile/:userName', component: UserPanelComponent,
    data: { roles: ['ROLE_CANDIDATE', 'ROLE_COMPANY'] },
    canActivate: [AuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
