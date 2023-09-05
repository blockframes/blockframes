import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ReactiveFormsModule } from '@angular/forms';

import { WaterfallActionComponent } from './waterfall-action.component';

// Blockframes
import { MovieHeaderModule } from '@blockframes/movie/components/header/header.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';

@NgModule({
  declarations: [WaterfallActionComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ClipboardModule,

    MovieHeaderModule,

    MatIconModule,
    MatButtonModule,
    MatChipsModule,

    RouterModule.forChild([{ path: '', component: WaterfallActionComponent }])
  ]
})
export class WaterfallActionModule { }
