import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPanelComponent } from './admin-panel/admin-panel.component';

const routes: Routes = [
  {path: '', redirectTo: 'admin', pathMatch: 'full' },
  {path: 'admin', component: AdminPanelComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AdminRoutingModule { }
