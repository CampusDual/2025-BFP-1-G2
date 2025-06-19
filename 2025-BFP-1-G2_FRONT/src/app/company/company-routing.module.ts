import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CompanyPanelComponent } from '../company-panel/company-panel.component';
import { OffersComponent } from './offers/offers.component';

const routes: Routes = [
  {path: '', redirectTo: '/company/myoffers', pathMatch: 'full' },
  {path: 'myoffers', component: OffersComponent },
  {path: ':companyName', component: CompanyPanelComponent },
  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
