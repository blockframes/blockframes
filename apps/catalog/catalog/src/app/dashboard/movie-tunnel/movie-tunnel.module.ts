// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { Routes } from '@angular/router';

// Component
import { MovieTunnelComponent } from './movie-tunnel.component';
import { MovieTunnelRoutingModule } from './movie-tunnel-routing.module';

// Materials
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@NgModule({
  declarations: [MovieTunnelComponent],
  imports: [
    CommonModule,
    MovieTunnelRoutingModule,
    FlexLayoutModule,
    MatToolbarModule,
    MatIconModule,
    MatSidenavModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
  ],
  exports: [MovieTunnelComponent]
})
export class MovieTunnelModule {}
