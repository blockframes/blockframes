import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { MovieFormScoringModule } from '@blockframes/movie/movie/form/sales-info/scoring/scoring.module';
import { MovieFormSalesInfoModule } from '@blockframes/movie/movie/form/sales-info/sales-info.module';
import { EvaluationComponent } from './evaluation.component';


// Material
import { MatExpansionModule } from '@angular/material/expansion';

@NgModule({
  declarations: [EvaluationComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TunnelPageModule,
    MovieFormScoringModule,
    MovieFormSalesInfoModule,
    // Material
    MatExpansionModule,
    // Route
    RouterModule.forChild([{ path: '', component: EvaluationComponent }])
  ]
})
export class EvaluationModule { }
