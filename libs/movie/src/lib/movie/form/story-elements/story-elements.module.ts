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
import { MovieFormStoryModule } from '@blockframes/movie/form/story/story.module';

// Blockframes UI
import { TunnelPageModule } from '@blockframes/ui/tunnel';

import { MovieFormStoryElementsComponent } from './story-elements.component';

@NgModule({
  declarations: [MovieFormStoryElementsComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    // Movie Form Modules
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
    RouterModule.forChild([{ path: '', component: MovieFormStoryElementsComponent }]),
  ],
})
export class MovieFormStoryElementsModule { }
