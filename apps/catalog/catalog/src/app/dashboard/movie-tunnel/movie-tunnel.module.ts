// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Component
import { MovieTunnelComponent } from './movie-tunnel.component';
import { MovieTunnelRoutingModule } from './movie-tunnel-routing.module';

// Materials
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';

import { TunnelLayoutModule } from '@blockframes/ui/tunnel';
import { AppLogoModule } from '@blockframes/ui/layout/app-logo/app-logo.module';
import { ImgAssetModule } from '@blockframes/ui/theme';

@NgModule({
  declarations: [MovieTunnelComponent],
  imports: [
    CommonModule,
    MovieTunnelRoutingModule,
    RouterModule,
    FlexLayoutModule,
    TunnelLayoutModule,
    AppLogoModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatSnackBarModule,
    MatDialogModule
  ]
})
export class MovieTunnelModule {}
