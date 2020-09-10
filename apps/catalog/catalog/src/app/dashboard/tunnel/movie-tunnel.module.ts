// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Component
import { MovieTunnelComponent } from './movie-tunnel.component';

// Blockframes
import { MovieFormShellModule } from '@blockframes/movie/form/shell/shell.module';

// Routing
import { MovieTunnelRoutingModule } from './movie-tunnel-routing.module';

@NgModule({
  declarations: [MovieTunnelComponent],
  imports: [
    CommonModule,
    MovieTunnelRoutingModule,
    RouterModule,
    MovieFormShellModule,
  ]
})
export class MovieTunnelModule { }
