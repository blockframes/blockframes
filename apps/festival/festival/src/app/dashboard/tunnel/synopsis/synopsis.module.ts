import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TunnelSynopsisComponent } from './synopsis.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormPromotionalDescriptionModule } from '@blockframes/movie/form/promotional-description/promotional-description.module';
import { MovieFormStoryModule } from '@blockframes/movie/form/story/story.module';
import { ReactiveFormsModule } from '@angular/forms';
import { MovieFormKeywordsModule } from '@blockframes/movie/form/promotional-description/keywords/keywords.module';

// Material
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [TunnelSynopsisComponent],
  imports: [
    ReactiveFormsModule,
    TunnelPageModule,
    MovieFormKeywordsModule,
    MovieFormPromotionalDescriptionModule,
    MovieFormStoryModule,
    RouterModule.forChild([{ path: '', component: TunnelSynopsisComponent }]),
    MatCardModule
  ],
})
export class TunnelSynopsisModule { }
