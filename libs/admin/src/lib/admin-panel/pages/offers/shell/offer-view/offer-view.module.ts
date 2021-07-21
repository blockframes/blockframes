import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { OfferViewComponent } from './offer-view.component';

import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { FirstUserFromOrgIdModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';

import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [OfferViewComponent],
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
    TagModule,

    //Material
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatInputModule,
    MatIconModule,

    RouterModule.forChild([{ path: '', component: OfferViewComponent }]),
  ]
})
export class OfferViewModule { }
