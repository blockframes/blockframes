// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SaleListComponent } from './list.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ExternalSaleListModule } from '@blockframes/contract/contract/list/external-sales/external-sale.module';
import { InternalSalesListModule } from '@blockframes/contract/contract/list/internal-sales/internal-sales.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { IntercomModule } from 'ng-intercom';

@NgModule({
  declarations: [SaleListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    ImageModule,
    IntercomModule,
    InternalSalesListModule,
    ExternalSaleListModule,

    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: SaleListComponent }])
  ],
})
export class CatalogSaleListModule { }
