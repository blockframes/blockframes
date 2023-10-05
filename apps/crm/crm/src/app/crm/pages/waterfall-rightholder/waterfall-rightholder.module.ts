import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ReactiveFormsModule } from '@angular/forms';

import { WaterfallRightholderComponent } from './waterfall-rightholder.component';

// Blockframes
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ToLabelModule } from '@blockframes/utils/pipes';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [WaterfallRightholderComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClipboardModule,
    
    MovieHeaderModule,
    StaticSelectModule,
    TableModule,
    ToLabelModule,

    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSnackBarModule,

    RouterModule.forChild([{ path: '', component: WaterfallRightholderComponent }])
  ]
})
export class WaterfallRightholderModule { }
