import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { GetPathModule } from '@blockframes/utils/pipes/get-path.pipe';

// Components
import { SummaryFinancialDetailsComponent } from './financial-details.component';
import { MissingControlModule } from '@blockframes/ui/missing-control/missing-control.module';
import { BudgetPipeModule } from '@blockframes/movie/pipes/budget.pipe';
import { EmptyImagePipeModule } from '@blockframes/media/directives/image-reference/image-reference.pipe';

// Materials
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDividerModule } from '@angular/material/divider';

@NgModule({
  declarations: [SummaryFinancialDetailsComponent],
  exports: [SummaryFinancialDetailsComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    TunnelPageModule,
    GetPathModule,
    MissingControlModule,
    BudgetPipeModule,
    EmptyImagePipeModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDividerModule,
    RouterModule.forChild([])
  ],
})
export class SummaryFinancialDetailsModule { }
