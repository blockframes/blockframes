import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogContractViewComponent } from './view.component';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ContractItemModule } from '@blockframes/contract/contract/item/contract-item.module';
import { IncomePipeModule } from '@blockframes/contract/income/pipe';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { HoldbackListModule } from '@blockframes/contract/contract/holdback/list/list.module';
import { ConfirmDeclineComponentModule } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.module';

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';

@NgModule({
  declarations: [CatalogContractViewComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaxLengthModule,
    ContractItemModule,
    IncomePipeModule,
    TagModule,
    ToLabelModule,
    HoldbackListModule,
    ConfirmDeclineComponentModule,

    //Material
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: CatalogContractViewComponent }]),
  ]
})
export class CatalogContractViewModule { }
