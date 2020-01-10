// Angular
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

// Material
import { MatCardModule } from '@angular/material/card';

// Tunnel 
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { TunnelPreviousDealsComponent } from './previous-deals.component';

// Component Modules
import { ContractFormDisplayNameModule } from '@blockframes/contract/forms/display-name/display-name.module';
import { DistributionDealExclusiveModule } from '@blockframes/movie/distribution-deals/form/exclusive/exclusive.module';

// Forms
import { DistributionDealForm } from '@blockframes/movie/distribution-deals/form/distribution-deal.form';
import { ContractForm } from '@blockframes/contract/forms/contract.form';

@NgModule({
  declarations: [TunnelPreviousDealsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,

    // Component Modules
    ContractFormDisplayNameModule,
    DistributionDealExclusiveModule,

    RouterModule.forChild([{ path: '', component: TunnelPreviousDealsComponent }]),

    // Material
    MatCardModule
  ],
  providers: [ContractForm, DistributionDealForm]
})
export class TunnelPreviousDealsModule {}
