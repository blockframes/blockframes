import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { FlexLayoutModule } from '@angular/flex-layout';
import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';

import { DealListComponent } from './list.component';
import { ContractTableModule } from '@blockframes/contract/contract/components';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [DealListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    ContractTableModule,
    ImgAssetModule,

    // Material
    MatTabsModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: DealListComponent }])
  ]
})
export class DealListModule { }
