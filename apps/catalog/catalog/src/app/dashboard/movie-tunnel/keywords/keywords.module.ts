import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TunnelKeywordsComponent } from './keywords.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';
import { MovieFormPromotionalDescriptionModule } from '@blockframes/movie/movie/form/promotional-description/promotional-description.module';
import { ReactiveFormsModule } from '@angular/forms';

// Material
import { MatExpansionModule } from '@angular/material/expansion';

const material = [
  MatExpansionModule
]
@NgModule({
  declarations: [TunnelKeywordsComponent],
  imports: [
    ReactiveFormsModule,
    TunnelPageModule,
    MovieFormPromotionalDescriptionModule,
    RouterModule.forChild([{ path: '', component: TunnelKeywordsComponent }]),
    ...material
  ],
})
export class TunnelKeywordsModule {}
