import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Component
import { ContractViewComponent } from './contract-view.component';

// Modules
import { ConfirmWithValidationModule } from '@blockframes/contract/contract/components/confirm-with-validation/confirm-with-validation.module';
import { NegotiationPipeModule } from '@blockframes/contract/negotiation/pipe';
import { ContractItemModule } from '@blockframes/contract/contract/components/item/contract-item.module';
import { HoldbackListModule } from '@blockframes/contract/contract/holdback/list/list.module';

// Materials
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [
    ContractViewComponent
  ],
  imports: [
    CommonModule,
    ContractItemModule,
    ConfirmWithValidationModule,
    HoldbackListModule,
    NegotiationPipeModule,
    MatButtonModule,
    MatButtonModule,
    FlexLayoutModule,
    MatIconModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: ContractViewComponent }])
  ]
})
export class ContractViewModule { }
