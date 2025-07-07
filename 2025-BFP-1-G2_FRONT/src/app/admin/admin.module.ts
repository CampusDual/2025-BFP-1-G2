import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { MatTableModule } from '@angular/material/table';
import { OfferPanelModule } from '../offer-panel/offer-panel.module';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from "@angular/material/button";
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { MatChipsModule } from "@angular/material/chips";
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import {NgChartsModule} from "ng2-charts";
import {SharedModule} from "../shared/shared.module";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [
    AdminPanelComponent,
    AdminDashboardComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatTableModule,
    OfferPanelModule,
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatChipsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    NgChartsModule,
    SharedModule,
    MatProgressSpinnerModule
  ]
})
export class AdminModule { }
