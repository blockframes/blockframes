
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FileNameModule } from '@blockframes/utils/pipes/fileName.pipe';
import { MaxLengthModule } from '@blockframes/utils/pipes/max-length.pipe';

import { MeetingMediaListComponent } from './media-list.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { FileTypeImagePipeModule } from '@blockframes/media/pipes/file-type-image.pipe';

import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@NgModule({
  declarations: [ MeetingMediaListComponent ],
  imports: [
    CommonModule,

    FileNameModule,
    ImageReferenceModule,
    MaxLengthModule,
    FileTypeImagePipeModule,

    MatTooltipModule,
    MatButtonModule,
    MatCardModule,
    MatListModule,

    RouterModule,
  ],
  exports: [ MeetingMediaListComponent ],
})
export class MeetingMediaListModule {}
