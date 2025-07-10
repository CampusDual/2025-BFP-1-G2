import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Angular Material Modules
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { UserRoutingModule } from './user-routing.module';
import { CompaniesComponent } from './companies/companies.component';
import { SharedModule } from '../shared/shared.module';
import { UserPanelComponent } from './user-panel/user-panel.component';
import { MatTabsModule } from '@angular/material/tabs'; // Import MatTabsModule
import { MatCardModule } from '@angular/material/card'; // Import MatCardModule

@NgModule({
  declarations: [
    CompaniesComponent,
    UserPanelComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoutingModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSnackBarModule,
    SharedModule,
    MatTabsModule,
    MatCardModule
  ]
})
export class UserModule { }
