import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TunnelSynopsisComponent } from './synopsis.component';
import { TunnelPageModule } from '@blockframes/ui/tunnel/page/tunnel-page.module';

// Material
import { MatCardModule } from '@angular/material/card';

const material = [
  MatCardModule
]
@NgModule({
  declarations: [TunnelSynopsisComponent],
  imports: [
    TunnelPageModule,
    RouterModule.forChild([{ path: '', component: TunnelSynopsisComponent }]),
    ...material
  ],
})
export class TunnelSynopsisModule {}
