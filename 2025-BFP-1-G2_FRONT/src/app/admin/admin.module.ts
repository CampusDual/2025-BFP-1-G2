import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { MatTableModule } from '@angular/material/table';
import { OfferPanelModule } from '../offer-panel/offer-panel.module';

@NgModule({
  declarations: [
    AdminPanelComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    MatTableModule,
    OfferPanelModule
  ]
})
export class AdminModule { }
