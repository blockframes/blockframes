import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealViewComponent } from './view.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

import { MovieContractGuard } from '@blockframes/movie/movieguards/movie-contract.guard';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDividerModule } from '@angular/material';

@NgModule({
  declarations: [DealViewComponent],
  imports: [
    FlexLayoutModule,
    TableFilterModule,
    ImageReferenceModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatDividerModule,
    CommonModule,
    RouterModule.forChild([
      {
        path: '',
        canActivate: [MovieContractGuard],
        canDeactivate: [MovieContractGuard],
        component: DealViewComponent
      }
    ])
  ]
})
export class DealViewModule {}
