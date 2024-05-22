import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { VideoViewerComponent } from '../../video/viewer/viewer.component';

// Blockframes
import { ImageModule } from '../../image/directives/image.module';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';
import { SnackbarErrorModule } from '@blockframes/ui/snackbar/error/snackbar-error.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [VideoViewerComponent],
  imports: [
    CommonModule,

    FlexLayoutModule,
    LogoSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    SnackbarErrorModule,

    ImageModule,
  ],
  exports: [VideoViewerComponent],
})
export class VideoViewerModule { }