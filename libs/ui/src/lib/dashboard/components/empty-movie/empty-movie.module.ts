// Angular
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { EmptyMovieComponent } from './empty-movie.component';

// Blockframes
import { NoTitleModule } from '@blockframes/ui/dashboard/components/no-title/no-title.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppPipeModule } from '@blockframes/utils/pipes';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [EmptyMovieComponent],
  imports: [
    // Angular
    FlexLayoutModule,

    // Blockframes
    NoTitleModule,
    ImageModule,
    AppPipeModule,

    // Material
    MatButtonModule,
  ],
  exports: [EmptyMovieComponent]
})
export class EmptyMovieModule { }
