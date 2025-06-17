import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { OffersComponent } from './offers/offers.component';
import { OfferPanelModule } from "../offer-panel/offer-panel.module";
import { OfferCardComponent } from '../offer-panel/offer-card/offer-card.component';


@NgModule({
  declarations: [
    OffersComponent
  ],
  imports: [
    CommonModule,
    CompanyRoutingModule,
    OfferPanelModule,
]
})
export class CompanyModule { }
