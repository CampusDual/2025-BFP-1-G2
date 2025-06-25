import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { MatTableModule } from '@angular/material/table';
import { OfferPanelModule } from '../offer-panel/offer-panel.module';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule } from '@angular/forms';
import {MatButtonModule} from "@angular/material/button";


@NgModule({
  declarations: [
    AdminPanelComponent
  ],
    imports: [
        CommonModule,
        AdminRoutingModule,
        MatTableModule,
        OfferPanelModule,
        MatIconModule,
        ReactiveFormsModule,
        MatButtonModule
    ]
})
export class AdminModule { }
