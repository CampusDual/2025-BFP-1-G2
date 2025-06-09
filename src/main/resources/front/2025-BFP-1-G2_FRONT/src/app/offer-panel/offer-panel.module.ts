import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfferPanelRoutingModule } from './offer-panel-routing.module';
import { OfferTableComponent } from './offer-table/offer-table.component';
import { OfferCardComponent } from './offer-card/offer-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [
    OfferCardComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  exports: [
    OfferCardComponent
  ]
})
export class OfferPanelModule {

 }

