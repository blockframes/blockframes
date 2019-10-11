import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { DropZoneDirective } from './drop-zone.directive';
import { ImageCropperModule } from 'ngx-image-cropper';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Angular Fire
import { firebase } from '@env';
import { AngularFireModule } from '@angular/fire';
import { AngularFireStorageModule } from '@angular/fire/storage';
import { AngularFirestoreModule } from '@angular/fire/firestore';

// Components
import {ImageCropperComponent} from './image-cropper/image-cropper.component';
import {CropperPageComponent} from './page/cropper-page.component';

@NgModule({
  declarations: [DropZoneDirective, ImageCropperComponent, CropperPageComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ImageCropperModule,
    AngularFireModule.initializeApp({firebase}),
    AngularFireStorageModule,
    AngularFirestoreModule
  ],
  exports: [DropZoneDirective, ImageCropperComponent, CropperPageComponent]
})
export class CropperModule {}
