// Angular
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { MovieTunnelComponent } from './movie-tunnel.component';
import { MovieTunnelRoutingModule } from './movie-tunnel-routing.module';


@NgModule({
  declarations: [MovieTunnelComponent],
  imports: [
    CommonModule,
    HttpClientModule,
    MovieTunnelRoutingModule
  ]
})
export class MovieTunnelModule {}
