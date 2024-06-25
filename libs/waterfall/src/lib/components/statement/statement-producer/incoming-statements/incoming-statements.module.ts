// Angular
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Pages
import { IncomingStatementComponent } from './incoming-statements.component';

// Blockframes
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [IncomingStatementComponent],
  imports: [
    BfCommonModule,
    ReactiveFormsModule,

    // Material
    MatCheckboxModule,
    MatTabsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatTooltipModule,

    RouterModule,
  ],
  exports: [IncomingStatementComponent]
})
export class IncomingStatementModule { }
