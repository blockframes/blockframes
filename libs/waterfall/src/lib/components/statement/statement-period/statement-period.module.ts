// Angular
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Blockframes
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Pages
import { StatementPeriodComponent } from './statement-period.component';

// Material
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [StatementPeriodComponent],
  imports: [
    BfCommonModule,
    ReactiveFormsModule,

    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatButtonToggleModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,

    RouterModule,
  ],
  exports: [StatementPeriodComponent]
})
export class StatementPeriodModule { }
