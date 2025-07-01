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

@NgModule({
  declarations: [
    CompaniesComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    UserRoutingModule,
    
    // Angular Material
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatSnackBarModule,
    
    // Shared Components
    SharedModule
  ]
})
export class UserModule { }
