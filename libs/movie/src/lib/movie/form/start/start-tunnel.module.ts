// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MovieFormStartTunnelComponent } from './start-tunnel.component';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [MovieFormStartTunnelComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageReferenceModule,

    // Material
    MatButtonModule,
    MatProgressSpinnerModule,

    // Router
    RouterModule.forChild([{ path: '', component: MovieFormStartTunnelComponent }]),
  ],
})
export class StartTunnelModule {}
