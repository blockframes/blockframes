import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { OfferViewComponent } from './offer-view.component';

import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';
import { FirstUserFromOrgIdModule, MaxLengthModule, ToLabelModule } from '@blockframes/utils/pipes';
import { TagModule } from '@blockframes/ui/tag/tag.module';
import { GetTitlePipeModule } from '@blockframes/movie/pipes/get-title.pipe';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { NegotiationPipeModule } from '@blockframes/contract/negotiation/pipe';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

@NgModule({
  declarations: [OfferViewComponent],
  imports: [
    CommonModule,
    TableModule,
    ReactiveFormsModule,
    ConfirmModule,
    FlexLayoutModule,
    FirstUserFromOrgIdModule,
    GetTitlePipeModule,
    GetOrgPipeModule,
    MaxLengthModule,
    TagModule,
    ToLabelModule,
    NegotiationPipeModule,
    StaticSelectModule,

    //Material
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,

    RouterModule.forChild([{ path: '', component: OfferViewComponent }]),
  ]
})
export class OfferViewModule { }
