import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TitleUploadComponent } from './upload.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

import { UploadModule } from '@blockframes/media/components/upload/upload.module';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [TitleUploadComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Material
    MatCardModule,
    MatIconModule,
    MatButtonModule,

    UploadModule,

    RouterModule.forChild([{ path: '', component: TitleUploadComponent }])
  ]
})
export class TitleUploadModule {}
