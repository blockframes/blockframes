import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { OfferShellComponent } from './shell.component';

import { TagModule } from '@blockframes/ui/tag/tag.module';
import { ToLabelModule, TotalPipeModule } from '@blockframes/utils/pipes';

import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    OfferShellComponent
  ],
  imports: [
    CommonModule,
    ToLabelModule,
    TotalPipeModule,
    TagModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{
      path: '',
      component: OfferShellComponent,
      children: [{
        path: '',
        loadChildren: () => import('./contract-list/contract-list.module').then(m => m.ContractListModule)
      }, {
        path: ':contractId',
        loadChildren: () => import('./contract-view/contract-view.module').then(m => m.ContractViewModule)
      }]
    }])
  ]
})
export class ShellModule { }
