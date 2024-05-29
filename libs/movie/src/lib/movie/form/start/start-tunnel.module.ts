// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MovieFormStartTunnelComponent } from './start-tunnel.component';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';

@NgModule({
  declarations: [MovieFormStartTunnelComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ImageModule,

    // Material
    MatButtonModule,
    MatProgressSpinnerModule,

    // Router
    RouterModule.forChild([{ path: '', component: MovieFormStartTunnelComponent }])
  ],
})
export class StartTunnelModule { }
