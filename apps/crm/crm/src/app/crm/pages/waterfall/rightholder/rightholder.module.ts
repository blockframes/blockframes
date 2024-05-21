import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ReactiveFormsModule } from '@angular/forms';

import { RightholderComponent } from './rightholder.component';

// Blockframes
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { GetOrgPipeModule } from '@blockframes/organization/pipes/get-org.pipe';
import { VersionSelectorModule } from '@blockframes/waterfall/components/version/version-selector/version-selector.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

@NgModule({
  declarations: [RightholderComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClipboardModule,
    
    StaticSelectModule,
    TableModule,
    ToLabelModule,
    PricePerCurrencyModule,
    GetOrgPipeModule,
    VersionSelectorModule,

    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatSelectModule,

    RouterModule.forChild([{ path: '', component: RightholderComponent }])
  ]
})
export class RightholderModule { }
