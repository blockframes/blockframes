import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MovieTunnelComponent } from "./movie-tunnel.component";
import { MovieTunnelGuard } from './movie-tunnel.guard';
const tunnelRoutes: Routes = [
  {
    path: '',
    component: MovieTunnelComponent,
    canActivate: [MovieTunnelGuard],
    canDeactivate: [MovieTunnelGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('./start/start-tunnel.module').then(m => m.StartTunnelModule)
      },
      {
        path: 'synopsis-keyassets',
        loadChildren: () => import('@blockframes/movie/movie/form/synopsis-keyassets/synopsis-keyassets.module').then(m => m.MovieFormSynopsisKeyAssetsModule)
      }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(tunnelRoutes)
  ],
  exports: [RouterModule]
})
export class MovieTunnelRoutingModule { }
