// Angular
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatSlideToggleModule } from '@angular/material';

// Tunnel
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { TunnelPreviousDealsComponent } from './previous-deals.component';

// Component Modules
import { ContractFormPartyNameModule } from '@blockframes/contract/forms/party-name/party-name.module';
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
    MatCardModule,
    MatSlideToggleModule
  ]
})
export class TunnelPreviousDealsModule {}
