import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OfferViewComponent } from './offer-view.component';
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
import { FirstUserFromOrgIdModule } from '@blockframes/utils/pipes';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';

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

    //Material
    MatSelectModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,

    RouterModule.forChild([{ path: '', component: OfferViewComponent }]),
  ]
})
export class OfferViewModule { }
