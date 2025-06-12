import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferTableComponent } from './offer-table/offer-table.component';
import { OfferCardComponent } from './offer-card/offer-card.component';

const routes: Routes = [
  {path: '', redirectTo: 'offer-table', pathMatch: 'full'},
  {path: 'offer-table', component: OfferTableComponent},
  {path: 'offer-card', component: OfferCardComponent}
];


@NgModule({
  imports: [RouterModule.forChild(routes),
    
  ],
  exports: [RouterModule,

  ]
})
export class OfferPanelRoutingModule { }
