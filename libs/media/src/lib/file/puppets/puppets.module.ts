import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';

import { FilePuppetsComponent } from './puppets.component';
import { PdfPuppetComponent } from '../../pdf/puppet/puppet.component';
import { VideoPuppetComponent } from '../../video/puppet/puppet.component';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [
    FilePuppetsComponent,
    PdfPuppetComponent,
    VideoPuppetComponent,
  ],
  imports: [
    CommonModule,

    FlexLayoutModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatSnackBarModule,

    FileNameModule,
    ImageModule,
  ],
  exports: [ FilePuppetsComponent, VideoPuppetComponent, PdfPuppetComponent ],
})
export class FilePuppetsModule {}
