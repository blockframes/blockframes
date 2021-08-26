import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { AuthWidgetComponent } from './widget.component';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRippleModule } from '@angular/material/core';

const material = [
  MatListModule,
  MatIconModule,
  MatButtonModule,
  MatSlideToggleModule,
  MatRippleModule
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FlexLayoutModule,
    OverlayWidgetModule,
    ImageModule,
    DisplayNameModule,
    ...material
  ],
  declarations: [AuthWidgetComponent],
  exports: [AuthWidgetComponent]
})
export class AuthWidgetModule { }
