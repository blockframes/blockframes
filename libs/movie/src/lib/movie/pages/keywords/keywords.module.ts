import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MovieFormKeywordsComponent } from './keywords.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel';
import { MovieFormPromotionalDescriptionModule } from '@blockframes/movie/form/promotional-description/promotional-description.module';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatCardModule } from '@angular/material/card';

const material = [
  MatCardModule
]
@NgModule({
  declarations: [MovieFormKeywordsComponent],
  imports: [
    ReactiveFormsModule,
    TunnelPageModule,
    MovieFormPromotionalDescriptionModule,
    RouterModule.forChild([{ path: '', component: MovieFormKeywordsComponent }]),
    ...material
  ],
})
export class TunnelKeywordsModule {}
