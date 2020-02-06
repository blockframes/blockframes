import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsSaleComponent } from './details-sale.component';

// Page
import { DistributionDealTermsModule } from '@blockframes/movie/distribution-deals/form/terms/terms.module';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { ContractFormPartyNameModule } from '../../form/party-name/party-name.module';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  imports: [
    CommonModule,

    // Page
    TunnelPageModule,
    ContractFormPartyNameModule,
    DistributionDealTermsModule,
    
    // Material
    MatCardModule,
    MatDividerModule
  ],
  declarations: [DetailsSaleComponent]
})
export class DetailsSaleModule { }
