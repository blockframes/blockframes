// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Pages
import { WaterfallSummaryAmortizationComponent } from './summary.component';

// Blockframes
import { BfCommonModule } from '@blockframes/utils/bf-common.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { RightHolderNamePipeModule } from '../../../pipes/rightholder-name.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [WaterfallSummaryAmortizationComponent],
  imports: [
    BfCommonModule,

    // Blockframes
    LogoSpinnerModule,
    PricePerCurrencyModule,
    RightHolderNamePipeModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatDividerModule,

    // Routing
    RouterModule.forChild([{
      path: '',
      component: WaterfallSummaryAmortizationComponent,
    }]),
  ],
})
export class WaterfallSummaryAmortizationModule { }
