import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsMandateComponent } from './details-mandate.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { ContractFormPartyModule } from '../../form/party/party.module';
import { DistributionRightTermsModule } from '@blockframes/distribution-rights/form/terms/terms.module';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { ContractVersionFormPriceModule } from '@blockframes/contract/version/form/price/price.module';
import { ContractVersionPaymentScheduleModule } from '@blockframes/contract/version/form/payment-schedule/payment-schedule.module';



@NgModule({
  declarations: [DetailsMandateComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: DetailsMandateComponent }]),
    ReactiveFormsModule,

    // Components
    TunnelPageModule,
    ContractFormPartyModule,
    DistributionRightTermsModule,
    ContractVersionFormPriceModule,
    ContractVersionPaymentScheduleModule,

    // Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    TextFieldModule
  ]
})
export class DetailsMandateModule { }
