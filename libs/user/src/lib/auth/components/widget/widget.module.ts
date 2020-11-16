import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthWidgetComponent } from './widget.component';

import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { UserNameModule } from '@blockframes/utils/pipes/user-name.pipe';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FlexLayoutModule } from '@angular/flex-layout';

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
    FlexLayoutModule,
    OverlayWidgetModule,
    UserNameModule,
    ImageReferenceModule,
    ...material
  ],
  declarations: [AuthWidgetComponent],
  exports: [AuthWidgetComponent]
})
export class AuthWidgetModule { }
