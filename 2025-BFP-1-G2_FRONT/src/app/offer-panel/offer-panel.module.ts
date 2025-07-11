import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OfferPanelRoutingModule } from './offer-panel-routing.module';
import { OfferTableComponent } from './offer-table/offer-table.component';
import { OfferCardComponent } from './offer-card/offer-card.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import {MatIconModule} from "@angular/material/icon";
import {MatBadgeModule} from '@angular/material/badge';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatExpansionModule} from "@angular/material/expansion";
import {MatTableModule} from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatChipsModule } from '@angular/material/chips';
import {  MatListModule} from "@angular/material/list";
import { MatSliderModule } from '@angular/material/slider';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { SharedModule } from '../shared/shared.module';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatAutocompleteModule } from '@angular/material/autocomplete';


export interface Offer {
  id: number;
  title: string;
  description: string;
  email: string;
  companyName: string;
  dateAdded: string;
  status: string;
}

@NgModule({
  declarations: [
    OfferTableComponent,
    OfferCardComponent
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
    FormsModule,
    MatExpansionModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatChipsModule,
    MatListModule,
    MatSliderModule,
    MatDividerModule,
    MatSnackBarModule,
    SharedModule,
    MatProgressSpinnerModule,
    MatAutocompleteModule
  ],
})
export class OfferPanelModule { }
