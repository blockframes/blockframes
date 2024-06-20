import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { StatementArbitraryChangeComponent } from './statement-arbitrary-change.component';

// Blockframes
import { GlobalModalModule } from '@blockframes/ui/global-modal/global-modal.module';
import { RightHolderNamePipeModule } from '../../../pipes/rightholder-name.pipe';
import { BfCommonModule } from '@blockframes/utils/bf-common.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [StatementArbitraryChangeComponent],
  imports: [
    BfCommonModule,
    ReactiveFormsModule,

    GlobalModalModule,
    RightHolderNamePipeModule,

    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatTooltipModule,

    RouterModule,
  ],
  exports: [StatementArbitraryChangeComponent]
})
export class StatementArbitraryChangeModule { }
