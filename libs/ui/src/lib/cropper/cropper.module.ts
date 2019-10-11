import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DropZoneDirective } from './drop-zone.directive';
import { ImageCropperModule } from 'ngx-image-cropper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Angular Fire
import { firebase } from '@env';
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';

// Components
import { CropperComponent } from './cropper/cropper.component';
import { CropperPageComponent } from './page/cropper-page.component';

@NgModule({
  declarations: [DropZoneDirective, CropperComponent, CropperPageComponent],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ImageCropperModule,
    AngularFireModule.initializeApp({firebase}),
    AngularFireStorageModule,
    AngularFirestoreModule
  ],
  exports: [DropZoneDirective, CropperComponent, CropperPageComponent]
})
export class CropperModule {}
