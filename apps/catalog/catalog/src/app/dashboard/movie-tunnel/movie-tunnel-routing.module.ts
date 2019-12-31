import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MovieTunnelComponent } from "./movie-tunnel.component";
import { StartTunnelComponent } from "./start/start-tunnel.component";

const tunnelRoutes: Routes = [
  {
    path: '',
    component: MovieTunnelComponent,
    children: [
      {
        path: 'start',
        component: StartTunnelComponent
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(tunnelRoutes)
  ],
  exports: [
    RouterModule
  ]
})
export class MovieTunnelRoutingModule { }
