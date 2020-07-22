// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Component
import { MovieFormShellComponent } from './shell.component';

// Materials
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { TunnelLayoutModule } from '@blockframes/ui/tunnel';

@NgModule({
  declarations: [MovieFormShellComponent],
  exports: [MovieFormShellComponent],
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    TunnelLayoutModule,
    AppLogoModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatSnackBarModule,
    MatDialogModule,
  ],
})
export class MovieFormShellModule { }
