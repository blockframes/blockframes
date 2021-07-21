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
import { MatFormFieldModule } from '@angular/material/form-field';

import { OrgChipModule } from '@blockframes/organization/components/chip/chip.module';
import { ConfirmInputModule } from '@blockframes/ui/confirm-input/confirm-input.module';
import { ContractItemModule } from '@blockframes/contract/contract/item/contract-item.module';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { HoldbackFormModule } from '@blockframes/contract/contract/holdback/form/form.module';

import { ContractViewComponent } from './contract-view.component';

@NgModule({
  declarations: [ContractViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,

    OrgChipModule,
    ConfirmInputModule,
    ContractItemModule,
    GetTitlePipeModule,
    HoldbackFormModule,

    MatIconModule,
    MatCardModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatTooltipModule,
    MatFormFieldModule,

    RouterModule.forChild([{ path: '', component: ContractViewComponent }]),
  ]
})
export class ContractViewModule { }
