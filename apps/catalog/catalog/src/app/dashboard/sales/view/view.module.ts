import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TagModule } from '@blockframes/ui/tag/tag.module';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { OrgNameModule } from '@blockframes/organization/pipes';
import { IncomePipeModule } from '@blockframes/contract/income/pipe';
import { MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ContractItemModule } from '@blockframes/contract/contract/item/contract-item.module';
import { HoldbackListModule } from '@blockframes/contract/contract/holdback/list/list.module';
import { ConfirmDeclineComponentModule } from '@blockframes/contract/contract/components/confirm-decline/confirm-decline.module';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import {MatSelectModule} from '@angular/material/select';

import { CatalogSaleViewComponent } from './view.component';


@NgModule({
  declarations: [CatalogSaleViewComponent],
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
    GetOrgPipeModule,
    ImageModule,
    OrgNameModule,

    //Material
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatDialogModule,
    MatSelectModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: CatalogSaleViewComponent }]),
  ]
})
export class CatalogSaleViewModule { }
