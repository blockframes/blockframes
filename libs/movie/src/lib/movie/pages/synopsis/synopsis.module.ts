import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MovieFormSynopsisComponent } from './synopsis.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormPromotionalDescriptionModule } from '@blockframes/movie/form/promotional-description/promotional-description.module';
import { MovieFormStoryModule } from '@blockframes/movie/form/story/story.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MovieFormKeywordsModule } from '@blockframes/movie/form/promotional-description/keywords/keywords.module';

// Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [MovieFormSynopsisComponent],
  imports: [
    ReactiveFormsModule,
    TunnelPageModule,
    MovieFormKeywordsModule,
    MovieFormPromotionalDescriptionModule,
    MovieFormStoryModule,
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatInputModule,
    CommonModule,
    RouterModule.forChild([{ path: '', component: MovieFormSynopsisComponent }]),
    MatCardModule
  ],
})
export class MovieFormSynopsisModule { }
