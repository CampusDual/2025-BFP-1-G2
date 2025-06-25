import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OffersComponent } from './offers/offers.component';
import { AddOfferComponent } from './add-offer/add-offer.component';
import { CandidatesComponent } from './candidates/candidates.component';

const routes: Routes = [
  {path: '', redirectTo: '/company/myoffers', pathMatch: 'full' },
  {path: 'myoffers', component: OffersComponent },
  {path: 'addOffer', component: AddOfferComponent },
  {path: 'candidates', component: CandidatesComponent},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }
