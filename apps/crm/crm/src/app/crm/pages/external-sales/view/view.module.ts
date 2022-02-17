import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';

import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';
import { ContractItemModule } from '@blockframes/contract/contract/components/item/contract-item.module';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { GetTitleHoldbacksPipeModule } from '@blockframes/movie/pipes/get-title-holdbacks';
import { HoldbackFormModule } from '@blockframes/contract/contract/holdback/form/form.module';
import { CollidingHoldbacksPipeModule } from '@blockframes/contract/contract/holdback/pipes/colliding-holdback.pipe'
import { ContractViewComponent, IsNegotiationNewPipe } from './view.component';

@NgModule({
  declarations: [ContractViewComponent, IsNegotiationNewPipe],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    OrgChipModule,
    ConfirmInputModule,
    ContractItemModule,
    GetTitleHoldbacksPipeModule,
    GetTitlePipeModule,
    HoldbackFormModule,
    CollidingHoldbacksPipeModule,
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
