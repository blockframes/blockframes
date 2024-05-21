// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { SaleListComponent } from './list.component';

// Modules
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { ExternalSaleListModule } from '@blockframes/contract/contract/list/external-sales/external-sale.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { InternalSalesListModule } from '@blockframes/contract/contract/list/internal-sales/internal-sales.module';
import { IntercomModule } from 'ng-intercom';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacySnackBarModule as MatSnackBarModule } from '@angular/material/legacy-snack-bar';

@NgModule({
  declarations: [SaleListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    // Modules
    ImageModule,
    IntercomModule,
    InternalSalesListModule,
    ExternalSaleListModule,
    LogoSpinnerModule,
    // Material
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    RouterModule.forChild([{ path: '', component: SaleListComponent }])
  ],
})
export class CatalogSaleListModule { }
