
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Component
import { WaterfallSidebarComponent } from './sidebar.component';

// Blockframes
import { BfCommonModule } from '@blockframes/utils/bf-common.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyRadioModule as MatRadioModule } from '@angular/material/legacy-radio';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

@NgModule({
  declarations: [WaterfallSidebarComponent],
  imports: [
    BfCommonModule,
    ReactiveFormsModule,
    RouterModule,

    PricePerCurrencyModule,

    MatIconModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatButtonToggleModule,
  ],
  exports: [WaterfallSidebarComponent],
})
export class WaterfallSidebarModule { }
