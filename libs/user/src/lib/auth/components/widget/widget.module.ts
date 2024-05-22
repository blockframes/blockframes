import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { AuthWidgetComponent } from './widget.component';
import { DisplayNameModule } from '@blockframes/utils/pipes/display-name.pipe';
import { OverlayWidgetModule } from '@blockframes/ui/overlay-widget';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyListModule as MatListModule } from '@angular/material/legacy-list';
import { MatLegacySlideToggleModule as MatSlideToggleModule } from '@angular/material/legacy-slide-toggle';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatRippleModule } from '@angular/material/core';
import { MatLegacySelectModule as MatSelectModule } from '@angular/material/legacy-select';

const material = [
  MatListModule,
  MatIconModule,
  MatButtonModule,
  MatSlideToggleModule,
  MatRippleModule,
  MatSelectModule
];

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
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
