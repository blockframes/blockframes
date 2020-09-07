import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Material
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

// Blockframes Movie
import { MovieFormPromotionalDescriptionModule } from '@blockframes/movie/form/promotional-description/promotional-description.module';
import { MovieFormStoryModule } from '@blockframes/movie/form/story/story.module';
import { MovieFormKeywordsModule } from '@blockframes/movie/form/promotional-description/keywords/keywords.module';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';

import { MovieFormSynopsisComponent } from './synopsis.component';

@NgModule({
  declarations: [MovieFormSynopsisComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Movie Form Modules
    MovieFormKeywordsModule,
    MovieFormPromotionalDescriptionModule,
    MovieFormStoryModule,

    // Other Modules
    TunnelPageModule,

    // Material
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    MatDividerModule,

    // Routes
    RouterModule.forChild([{ path: '', component: MovieFormSynopsisComponent }]),
  ],
})
export class MovieFormSynopsisModule { }
