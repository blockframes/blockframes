import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormBudgetComponent } from './budget.component';

// Forms
import { MovieFormEstimatedBudgetModule } from '@blockframes/movie/form/budget/estimated-budget/estimated-budget.module';
import { MovieFormBoxOfficeModule } from '@blockframes/movie/form/budget/box-office/box-office.module';
import { MovieFormCertificationsModule } from '@blockframes/movie/form/sales-info/certifications/certifications.module';
import { MovieFormRatingsModule } from '@blockframes/movie/form/sales-info/ratings/ratings.module';
import { MovieFormReviewModule } from '@blockframes/movie/form/review/review.module';

// Material
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [MovieFormBudgetComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    MovieFormEstimatedBudgetModule,
    MovieFormBoxOfficeModule,
    MovieFormCertificationsModule,
    MovieFormRatingsModule,
    MovieFormReviewModule,
    // Material
    MatCardModule,
    // Route
    RouterModule.forChild([{ path: '', component: MovieFormBudgetComponent }])
  ]
})
export class BudgetModule { }
