import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { AdminTagsComponent } from './admin-tags/admin-tags.component';
import {CompanyPanelComponent} from "../company/company-panel/company-panel.component";

const routes: Routes = [
  { path: '', component: AdminPanelComponent },
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'tags', component: AdminTagsComponent },
  { path: 'new', component: CompanyPanelComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AdminRoutingModule { }
