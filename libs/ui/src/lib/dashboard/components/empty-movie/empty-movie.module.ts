// Angular
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { EmptyMovieComponent } from './empty-movie.component';

// Blockframes
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [EmptyMovieComponent],
  imports: [
    // Angular
    FlexLayoutModule,

    // Blockframes
    NoTitleModule,
    ImageModule,

    // Material
    MatButtonModule,
    MatCardModule
  ],
  exports: [EmptyMovieComponent]
})
export class EmptyMovieModule { }
