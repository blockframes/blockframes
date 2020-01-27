// Angular
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';

// Tunnel
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { TunnelPreviousDealsComponent } from './previous-deals.component';

// Component Modules
import { ContractFormPartyNameModule } from '@blockframes/contract/contract/forms/party-name/party-name.module';
import { DistributionDealTerritoryModule } from '@blockframes/movie/distribution-deals/form/territory/territory.module';
import { DistributionDealRightsModule } from '@blockframes/movie/distribution-deals/form/rights/rights.module';
import { DistributionDealTermsModule } from '@blockframes/movie/distribution-deals/form/terms/terms.module';

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
    DistributionDealRightsModule,
    DistributionDealTermsModule,

    RouterModule.forChild([{ path: '', component: TunnelPreviousDealsComponent }]),

    // Material
    MatExpansionModule,
    MatDividerModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class TunnelPreviousDealsModule {}
