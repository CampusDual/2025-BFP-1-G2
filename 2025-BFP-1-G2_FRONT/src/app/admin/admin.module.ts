import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { MatTableModule } from '@angular/material/table';
import { OfferPanelModule } from '../offer-panel/offer-panel.module';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import {MatChipsModule} from "@angular/material/chips";


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
    MatChipsModule
  ]
})
export class AdminModule { }
