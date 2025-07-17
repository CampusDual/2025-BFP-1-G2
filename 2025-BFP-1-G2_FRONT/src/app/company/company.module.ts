import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CompanyRoutingModule } from './company-routing.module';
import { OffersComponent } from './offers/offers.component';
import { OfferPanelModule } from "../offer-panel/offer-panel.module";
import { MatFormFieldModule } from '@angular/material/form-field';
import { TextFieldModule } from '@angular/cdk/text-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import {  MatCardModule } from '@angular/material/card';
import {  MatButtonModule } from '@angular/material/button';
import {  MatIconModule } from '@angular/material/icon';
import {  MatMenuModule } from '@angular/material/menu';
import {CompanyPanelComponent} from "./company-panel/company-panel.component";
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner";
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from "@angular/material/chips";
import { MatOptionModule } from "@angular/material/core";
import { MatAutocompleteModule } from "@angular/material/autocomplete";


@NgModule({
  declarations: [
    OffersComponent,
    CompanyPanelComponent
  ],
  imports: [
    CommonModule,
    CompanyRoutingModule,
    OfferPanelModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    TextFieldModule,
    MatTableModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatChipsModule,
    MatOptionModule,
    MatAutocompleteModule
]
})
export class CompanyModule { }
