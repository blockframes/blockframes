import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';

import { TotalPipeModule } from '@blockframes/utils/pipes';
import { OfferShellComponent } from './shell.component';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

const routes: Routes = [{
  path: '',
  component: OfferShellComponent,
  children: [
    { path: '', redirectTo: 'view', pathMatch: 'full' },
    { path: 'view', loadChildren: () => import('./offer-view/offer-view.module').then(m => m.OfferViewModule) },
    { path: ':contractId', loadChildren: () => import('./contract-view/contract-view.module').then(m => m.ContractViewModule) },
    { path: ':contractId/form', loadChildren: () => import('./contract-form/contract-form.module').then(m => m.ContractFormModule) },
  ]
}]

@NgModule({
  declarations: [OfferShellComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,
    OrgChipModule,
    TotalPipeModule,

    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,

    RouterModule.forChild(routes),
  ]
})
export class OfferShellModule { }
