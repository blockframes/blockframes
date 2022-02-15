// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { SaleListComponent } from './list.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { IntercomModule } from 'ng-intercom';
import {SaleListModule} from '@blockframes/contract/contract/list/list.module'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [SaleListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    ImageModule,
    IntercomModule,
    SaleListModule,

    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: SaleListComponent }])
  ],
})
export class CatalogSaleListModule { }
