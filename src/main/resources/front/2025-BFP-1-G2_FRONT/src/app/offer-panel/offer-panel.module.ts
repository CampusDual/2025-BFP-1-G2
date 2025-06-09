import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfferPanelRoutingModule } from './offer-panel-routing.module';
import { OfferTableComponent } from './offer-table/offer-table.component';
import { OfferCardComponent } from './offer-card/offer-card.component';


@NgModule({
  declarations: [
    OfferTableComponent,
    OfferCardComponent
  ],
  imports: [
    CommonModule,
    OfferPanelRoutingModule
  ]
})
export class OfferPanelModule { }
