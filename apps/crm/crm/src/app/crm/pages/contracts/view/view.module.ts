import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';

import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';
import { ContractItemModule } from '@blockframes/contract/contract/components/item/contract-item.module';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { GetTitleHoldbacksPipeModule } from '@blockframes/movie/pipes/get-title-holdbacks';
import { HoldbackFormModule } from '@blockframes/contract/contract/holdback/form/form.module';
import { CollidingHoldbacksPipeModule } from '@blockframes/contract/contract/holdback/pipes/colliding-holdback.pipe';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ContractViewComponent } from './view.component';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

@NgModule({
  declarations: [ContractViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    OrgChipModule,
    ConfirmInputModule,
    ContractItemModule,
    GetTitleHoldbacksPipeModule,
    GetTitlePipeModule,
    StaticSelectModule,
    HoldbackFormModule,
    CollidingHoldbacksPipeModule,
    PricePerCurrencyModule,

    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatFormFieldModule,

    RouterModule.forChild([{ path: '', component: ContractViewComponent }]),
  ]
})
export class ContractViewModule { }
