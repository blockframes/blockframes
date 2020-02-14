import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsMandateComponent } from './details-mandate.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { ContractFormPartyModule } from '../../form/party/party.module';
import { DistributionDealTermsModule } from '@blockframes/movie/distribution-deals/form/terms/terms.module';



@NgModule({
  declarations: [DetailsMandateComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: DetailsMandateComponent }]),

    // Components
    TunnelPageModule,
    ContractFormPartyModule,
    DistributionDealTermsModule,

    // Material
    MatCardModule
  ]
})
export class DetailsMandateModule { }
