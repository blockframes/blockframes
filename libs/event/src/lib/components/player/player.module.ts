import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventPlayerComponent } from './player.component';
import { FlexLayoutModule } from '@angular/flex-layout';

// Components
import { ImgAssetModule } from '@blockframes/ui/theme';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { DisplayNameModule } from "@blockframes/utils/pipes/display-name.module";

// Materials
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';


@NgModule({
  declarations: [EventPlayerComponent],
  exports: [EventPlayerComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    // Component
    ImgAssetModule,
    ImageReferenceModule,
    DisplayNameModule,
    // Material
    MatProgressSpinnerModule,
    MatButtonModule,
    MatIconModule,
  ]
})
export class EventPlayerModule { }
