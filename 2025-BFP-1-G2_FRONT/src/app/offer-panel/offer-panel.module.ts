import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfferPanelRoutingModule } from './offer-panel-routing.module';
import { OfferTableComponent } from './offer-table/offer-table.component';
import { OfferCardComponent } from './offer-card/offer-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from "@angular/material/icon";
import {MatBadgeModule} from '@angular/material/badge';
import { DetailedCardComponent } from '../detailed-card/detailed-card.component';
import {FormsModule} from '@angular/forms';


export interface Offer {
  id: number;
  title: string;
  description: string;
  email: string;
  companyName: string;
  dateAdded: string;
}

@NgModule({
  declarations: [
    OfferTableComponent,
    OfferCardComponent,
    DetailedCardComponent
  ],
  exports: [
    OfferTableComponent,
    OfferCardComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    OfferPanelRoutingModule,
    MatIconModule,
    MatBadgeModule,
    FormsModule
  ]
})
export class OfferPanelModule { }
