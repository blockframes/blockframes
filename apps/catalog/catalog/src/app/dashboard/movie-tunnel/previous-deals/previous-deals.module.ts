// Angular
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Material
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material';
import { MatDividerModule } from '@angular/material/divider';

// Tunnel
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { TunnelPreviousDealsComponent } from './previous-deals.component';

// Component Modules
import { ContractFormPartyNameModule } from '@blockframes/contract/contract/forms/party-name/party-name.module';
import { DistributionDealTerritoryModule } from '@blockframes/movie/distribution-deals/form/territory/territory.module';

@NgModule({
  declarations: [TunnelPreviousDealsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    ReactiveFormsModule,

    // Component Modules
    ContractFormPartyNameModule,
    DistributionDealTerritoryModule,

    RouterModule.forChild([{ path: '', component: TunnelPreviousDealsComponent }]),

    // Material
    MatExpansionModule,
    MatDividerModule,
    MatSlideToggleModule
  ]
})
export class TunnelPreviousDealsModule {}
