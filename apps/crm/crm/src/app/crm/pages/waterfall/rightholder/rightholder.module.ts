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

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';

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

    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSnackBarModule,
    MatSelectModule,

    RouterModule.forChild([{ path: '', component: RightholderComponent }])
  ]
})
export class RightholderModule { }
