import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TagModule } from '@blockframes/ui/tag/tag.module';
import { OrgNameModule } from '@blockframes/organization/pipes';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ContractItemModule } from '@blockframes/contract/contract/components/item/contract-item.module';
import { ConfirmDeclineComponentModule } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { SaleShellComponent } from './shell.component';

const routes: Route[] = [
  {
    path: '', component: SaleShellComponent,
    children: [
      { path: '', redirectTo: 'view', },
      {
        path: 'view',
        loadChildren: () => import('./view/view.module').then(m => m.CatalogSaleViewModule)
      },
      {
        path: 'negotiation',
        loadChildren: () => import('./negotiation/negotiation.module').then(m => m.NegotiationModule),
      },
    ]
  },
]
@NgModule({
  declarations: [
    SaleShellComponent,
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ContractItemModule,
    TagModule,
    ToLabelModule,
    ConfirmDeclineComponentModule,
    GetOrgPipeModule,
    ImageModule,
    OrgNameModule,

    //Material
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    RouterModule.forChild(routes),
  ]
})
export class CatalogSaleShellModule { }
