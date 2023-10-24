import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ReactiveFormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';

import { RightholderComponent } from './rightholder.component';

// Blockframes
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ToLabelModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [RightholderComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClipboardModule,
    NgApexchartsModule,
    
    StaticSelectModule,
    TableModule,
    ToLabelModule,
    PricePerCurrencyModule,

    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSnackBarModule,

    RouterModule.forChild([{ path: '', component: RightholderComponent }])
  ]
})
export class RightholderModule { }
