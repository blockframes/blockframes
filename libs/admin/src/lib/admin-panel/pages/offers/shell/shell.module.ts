import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShellComponent } from './shell.component';
import { RouterModule } from '@angular/router';

const routes = [{
  path: '',
  component: ShellComponent,
  children: [
    { path: '', loadChildren: () => import('./offer-view/offer-view.module').then(m => m.OfferViewModule) },
    { path: ':contractId', loadChildren: () => import('./contract-view/contract-view.module').then(m => m.ContractViewModule) },
    { path: ':contractId/form', loadChildren: () => import('./contract-form/contract-form.module').then(m => m.ContractFormModule) },
  ]
}]

@NgModule({
  declarations: [ShellComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
  ]
})
export class ShellModule { }
