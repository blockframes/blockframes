// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Blockframes
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { PricePerCurrencyModule } from '@blockframes/ui/price-per-currency/price-per-currency.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { RightHolderNamePipeModule } from '../../../pipes/rightholder-name.pipe';
import { JoinPipeModule, ToGroupLabelPipeModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DetailedGroupModule } from '@blockframes/ui/detail-modal/detailed.module';

// Component
import { SalesListComponent } from './sales-list.component';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [SalesListComponent],
  imports: [
    CommonModule,

    TableModule,
    PricePerCurrencyModule,
    ToGroupLabelPipeModule,
    JoinPipeModule,
    LogoSpinnerModule,
    RightHolderNamePipeModule,
    DetailedGroupModule,
    ImageModule,

    // Material
    MatButtonModule
  ],
  exports: [SalesListComponent]
})
export class SalesListModule { }
