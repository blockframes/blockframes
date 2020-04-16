// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatTooltipModule } from '@angular/material/tooltip';

// Component
import {
  HeaderComponent,
  MovieHeaderPreferences,
  MovieHeaderButton,
  MovieHeaderActions
} from './header.component';

// Blockframes
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';



@NgModule({
  declarations: [
    HeaderComponent,
    MovieHeaderPreferences,
    MovieHeaderButton,
    MovieHeaderActions
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    DisplayNameModule,
    ImageReferenceModule,

    // Material
    MatTooltipModule
  ],
  exports: [
    HeaderComponent,
    MovieHeaderPreferences,
    MovieHeaderButton,
    MovieHeaderActions
  ]
})
export class MovieHeaderModule { }
