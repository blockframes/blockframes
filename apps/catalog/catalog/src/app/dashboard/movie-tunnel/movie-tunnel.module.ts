// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';

// Component
import { MovieTunnelComponent } from './movie-tunnel.component';
import { MovieTunnelRoutingModule } from './movie-tunnel-routing.module';

// Materials
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
@NgModule({
  declarations: [MovieTunnelComponent],
  imports: [
    CommonModule,
    MovieTunnelRoutingModule,
    RouterModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatButtonModule,
    MatCardModule,
  ],
  exports: [MovieTunnelComponent]
})
export class MovieTunnelModule {}
