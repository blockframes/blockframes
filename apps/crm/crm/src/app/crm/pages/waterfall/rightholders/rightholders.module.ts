import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RightholdersComponent } from './rightholders.component';

// Blockframes
import { RightholderTableModule } from '@blockframes/waterfall/components/rightholder/rightholder-table/rightholder-table.module';
import { ConfirmModule } from '@blockframes/ui/confirm/confirm.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [RightholdersComponent],
  imports: [
    CommonModule,

    RightholderTableModule,
    ConfirmModule,

    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,

    RouterModule.forChild([{ path: '', component: RightholdersComponent }])
  ]
})
export class RightholdersModule { }
