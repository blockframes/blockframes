import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CatalogContractViewComponent } from './view.component';
import { RouterModule } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FirstUserFromOrgIdModule, MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { ContractItemModule } from '@blockframes/contract/contract/item/contract-item.module';
import { IncomePipeModule } from '@blockframes/contract/income/pipe';
import { TagModule } from '@blockframes/ui/tag/tag.module';

@NgModule({
  declarations: [CatalogContractViewComponent],
  imports: [
    CommonModule,
    TableFilterModule,
    ReactiveFormsModule,
    ConfirmModule,
    FlexLayoutModule,
    FirstUserFromOrgIdModule,
    GetTitlePipeModule,
    GetOrgPipeModule,
    MaxLengthModule,
    ContractItemModule,
    IncomePipeModule,
    TagModule,
    ToLabelModule,

    //Material
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatInputModule,
    MatIconModule,
    MatSnackBarModule,

    RouterModule.forChild([{ path: '', component: CatalogContractViewComponent }]),
  ]
})
export class CatalogContractViewModule { }
