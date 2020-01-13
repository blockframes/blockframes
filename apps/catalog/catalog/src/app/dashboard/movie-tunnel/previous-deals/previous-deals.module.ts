// Angular
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
import { ContractFormDisplayNameModule } from '@blockframes/contract/forms/display-name/display-name.module';
import { DistributionDealTerritoryModule } from '@blockframes/movie/distribution-deals/form/territory/territory.module';

@NgModule({
  declarations: [TunnelPreviousDealsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,

    // Component Modules
    ContractFormDisplayNameModule,
    DistributionDealTerritoryModule,

    RouterModule.forChild([{ path: '', component: TunnelPreviousDealsComponent }]),

    // Material
    MatCardModule,
    MatSlideToggleModule
  ]
})
export class TunnelPreviousDealsModule {}
