// Angular
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Page
import { DistributionDealTermsModule } from '@blockframes/movie/distribution-deals/form/terms/terms.module';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { ContractFormPartyNameModule } from '../../form/party-name/party-name.module';
import { DetailsSaleComponent } from './details-sale.component';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { ContractVersionFormPriceModule } from '@blockframes/contract/version/form/price/price.module';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule.forChild([{ path: '', component: DetailsSaleComponent }]),

    // Page
    TunnelPageModule,
    ContractFormPartyNameModule,
    DistributionDealTermsModule,
    ContractVersionFormPriceModule,

    // Material
    MatCardModule,
    MatDividerModule
  ],
  declarations: [DetailsSaleComponent]
})
export class DetailsSaleModule { }
