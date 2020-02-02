import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { ProfileWidgetComponent } from './profile-widget.component';

import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

const material = [
  MatListModule,
  MatIconModule,
  MatButtonModule,
  MatSlideToggleModule
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    OverlayWidgetModule,
    ImageReferenceModule,
    ...material
  ],
  declarations: [ProfileWidgetComponent],
  exports: [ProfileWidgetComponent]
})
export class ProfileWidgetModule {}
