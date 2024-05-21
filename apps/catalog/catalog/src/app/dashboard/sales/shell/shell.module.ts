import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Route, RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Blockframes
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { NegotiationPipeModule } from '@blockframes/contract/negotiation/pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ContractItemModule } from '@blockframes/contract/contract/components/item/contract-item.module';
import { ConfirmDeclineComponentModule } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';

// Component
import { SaleShellComponent } from './shell.component';

// Guard
import { CatalogSaleGuard } from './shell.guard';

const routes: Route[] = [
  {
    path: '', component: SaleShellComponent,
    children: [
      {
        path: '',
        redirectTo: 'view',
        pathMatch: 'full',
      },
      {
        path: 'external',
        loadChildren: () => import('./external/external.module').then(m => m.ExternalSaleModule)
      },
      {
        path: 'view',
        canActivate: [CatalogSaleGuard],
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
    NegotiationPipeModule,
    ImageModule,
    LogoSpinnerModule,

    //Material
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild(routes),
  ]
})
export class CatalogSaleShellModule { }
