import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormScoringModule } from '@blockframes/movie/movie/form/sales-info/scoring/scoring.module';
import { MovieFormSalesInfoModule } from '@blockframes/movie/movie/form/sales-info/sales-info.module';
import { EvaluationComponent } from './evaluation.component';


// Material
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [EvaluationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    MovieFormScoringModule,
    MovieFormSalesInfoModule,
    // Material
    MatCardModule,
    // Route
    RouterModule.forChild([{ path: '', component: EvaluationComponent }])
  ]
})
export class EvaluationModule { }
