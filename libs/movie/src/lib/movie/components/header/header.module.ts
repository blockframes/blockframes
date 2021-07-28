// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Component
import {
  HeaderComponent,
  MovieHeaderPreferences,
  MovieHeaderCTA,
  MovieHeaderActions
} from './header.component';

// Blockframes
import { DisplayNameModule } from '@blockframes/utils/pipes';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { MovieTitleFeaturesModule } from '../title-features/title-features.module';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  declarations: [
    HeaderComponent,
    MovieHeaderPreferences,
    MovieHeaderCTA,
    MovieHeaderActions
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    DisplayNameModule,
    ImageModule,
    MovieTitleFeaturesModule,
    MatIconModule,
    RouterModule
  ],
  exports: [
    HeaderComponent,
    MovieHeaderPreferences,
    MovieHeaderCTA,
    MovieHeaderActions
  ]
})
export class MovieHeaderModule { }
