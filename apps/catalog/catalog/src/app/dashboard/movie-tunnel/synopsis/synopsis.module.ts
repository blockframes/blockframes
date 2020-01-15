import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TunnelSynopsisComponent } from './synopsis.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { MovieFormPromotionalDescriptionModule } from '@blockframes/movie/movie/form/promotional-description/promotional-description.module';
import { MovieFormStoryModule } from '@blockframes/movie/movie/form/story/story.module';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatExpansionModule } from '@angular/material/expansion';

const material = [
  MatExpansionModule
]
@NgModule({
  declarations: [TunnelSynopsisComponent],
  imports: [
    ReactiveFormsModule,
    TunnelPageModule,
    MovieFormPromotionalDescriptionModule,
    MovieFormStoryModule,
    RouterModule.forChild([{ path: '', component: TunnelSynopsisComponent }]),
    ...material
  ],
})
export class TunnelSynopsisModule {}
