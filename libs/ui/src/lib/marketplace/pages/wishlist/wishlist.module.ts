// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DisplayNameModule, ToLabelModule } from '@blockframes/utils/pipes';
import { RunningTimePipeModule } from '@blockframes/movie/pipes/running-time.pipe';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatIconModule } from '@angular/material/icon';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { WishlistComponent } from './wishlist.component';

@NgModule({
  declarations: [WishlistComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Blockframes
    ImageModule,
    ToLabelModule,
    DisplayNameModule,
    RunningTimePipeModule,
    // Material
    MatButtonModule,
    MatDividerModule,
    MatTableModule,
    MatSortModule,
    MatIconModule,
    MatRippleModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: WishlistComponent }])
  ]
})
export class WishlistModule { }
