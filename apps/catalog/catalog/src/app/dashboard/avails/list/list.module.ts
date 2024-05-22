// Angular
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

//Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

// Modules
import { AvailsFilterModule } from '@blockframes/contract/avails/filter/filter.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { MaxLengthModule } from '@blockframes/utils/pipes';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';

// Pages
import { CatalogAvailsListComponent } from './list.component';

@NgModule({
  declarations: [
    CatalogAvailsListComponent,
  ],
  imports: [
    CommonModule,
    MaxLengthModule,
    FlexLayoutModule,
    //Blockframes
    TableModule,
    ImageModule,
    AvailsFilterModule,
    LogoSpinnerModule,
    PricePerCurrencyModule,
    //Material
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatSnackBarModule,

    RouterModule.forChild([{ path: '', component: CatalogAvailsListComponent }]
    ),
  ]
})
export class CatalogAvailsListModule { }
