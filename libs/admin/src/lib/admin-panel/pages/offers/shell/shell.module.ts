import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';

import {  ShellComponent } from './shell.component';
import { TotalPipeModule } from '@blockframes/utils/pipes';

const routes: Routes = [{
  path: '',
  component: ShellComponent,
  children: [
    { path: '', redirectTo: 'view' },
    { path: 'view', loadChildren: () => import('./offer-view/offer-view.module').then(m => m.OfferViewModule) },
    { path: ':contractId', loadChildren: () => import('./contract-view/contract-view.module').then(m => m.ContractViewModule) },
    { path: ':contractId/form', loadChildren: () => import('./contract-form/contract-form.module').then(m => m.ContractFormModule) },
  ]
}]

@NgModule({
  declarations: [ShellComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,
    OrgChipModule,
    TotalPipeModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,

    RouterModule.forChild(routes),
  ]
})
export class OfferShellModule { }
