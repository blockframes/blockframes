// Angular
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { MovieTunnelComponent } from './movie-tunnel.component';


@NgModule({
  declarations: [MovieTunnelComponent],
  imports: [
    CommonModule,
    HttpClientModule,
  ]
})
export class MovieTunnelModule {}
