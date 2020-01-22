import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DealViewComponent } from './view.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { TableFilterModule } from '@blockframes/ui/list/table-filter/table-filter.module';

import { MovieContractGuard } from '@blockframes/movie/movieguards/movie-contract.guard';

import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [DealViewComponent],
  imports: [
    FlexLayoutModule,
    TableFilterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
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
