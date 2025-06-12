import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OfferTableComponent } from './offer-table/offer-table.component';

const routes: Routes = [
  {path: '', redirectTo: 'portal', pathMatch: 'full'},
  {path: 'portal', component: OfferTableComponent},
  {path: 'auth', loadChildren : () => import('../auth/auth.module').then(m => m.AuthModule)},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OfferPanelRoutingModule { }
