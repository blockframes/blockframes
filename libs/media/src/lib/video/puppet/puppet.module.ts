
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatIconModule } from '@angular/material/icon';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { VideoPuppetComponent } from '../../video/puppet/puppet.component';

@NgModule({
  declarations: [ VideoPuppetComponent ],
  imports: [
    CommonModule,

    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,

    ImageModule,
  ],
  exports: [ VideoPuppetComponent ],
})
export class VideoPuppetModule {}
