import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { TitleUploadComponent } from './upload.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { UploadModule } from '@blockframes/ui/upload';
import { UnloadGuard } from '@blockframes/ui/upload/unload.guard';

@NgModule({
  declarations: [TitleUploadComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,

    UploadModule,

    // Material
    MatCardModule,
    MatIconModule,
    RouterModule.forChild([
      {
        path: '',
        canDeactivate: [UnloadGuard], // prevent the user to navigate away when file is uploading
        component: TitleUploadComponent
      }
    ])
  ]
})
export class TitleUploadModule {}
