import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OffersComponent } from './offers/offers.component';
import { CandidatesComponent } from './candidates/candidates.component';
import { CompanyPanelComponent } from "./company-panel/company-panel.component";
import { AuthGuard } from '../auth/auth.guard';

const routes: Routes = [
  { path: '', redirectTo: '/company/myoffers', pathMatch: 'full' },
  {
    path: 'myoffers', component: OffersComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_COMPANY'] }
  },
  {
    path: 'candidates', component: CandidatesComponent,
    canActivate: [AuthGuard],
    data: { roles: ['ROLE_COMPANY'] }
  },
  {
      path: 'profile/:companyName', component: CompanyPanelComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
