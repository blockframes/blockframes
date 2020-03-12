import { ImgAssetModule } from '@blockframes/ui/theme/img-asset.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DealListComponent } from './list.component';

import { ContractTableModule } from '@blockframes/contract/contract/components';

// Material
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Guards
import { ContractsDealListGuard } from '@blockframes/movie/distribution-deals/guards/contracts-deal-list.guard';
import { MovieListContractListGuard } from '@blockframes/movie/movie/guards/movie-contract.guard';

@NgModule({
  declarations: [DealListComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    ContractTableModule,
    ImgAssetModule,

    // Material
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([
      {
        path: '',
        canActivate: [ContractsDealListGuard, MovieListContractListGuard],
        canDeactivate: [ContractsDealListGuard, MovieListContractListGuard],
        component: DealListComponent
      }
    ])
  ]
})
export class DealListModule { }
