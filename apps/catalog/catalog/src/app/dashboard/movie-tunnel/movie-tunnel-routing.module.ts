import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MovieTunnelComponent } from './movie-tunnel.component';
import { TunnelGuard } from '@blockframes/ui/tunnel';

const tunnelRoutes: Routes = [
  {
    path: '',
    component: MovieTunnelComponent,
    canDeactivate: [TunnelGuard],
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        loadChildren: () => import('@blockframes/movie/form/main/main.module').then(m => m.MovieFormMainModule)
      },
      {
        path: 'synopsis',
        loadChildren: () => import('@blockframes/movie/form/synopsis/synopsis.module').then(m => m.MovieFormSynopsisModule)
      },
      {
        path: 'technical-info',
        loadChildren: () =>
          import('@blockframes/movie/form/technical-info/technical-info.module').then(m => m.TunnelTechnicalInfoModule)
      },
      {
        path: 'images',
        loadChildren: () => import('@blockframes/movie/form/promotional-elements/media-images/media-images.module').then(m => m.MovieFormMediaImagesModule)
      },
      {
        path: 'files&links',
        loadChildren: () => import('@blockframes/movie/form/promotional-elements/media-files/media-files.module').then(m => m.MovieFormMediaFilesModule)
      },
      {
        path: 'summary',
        loadChildren: () => import('@blockframes/movie/form/summary/summary.module').then(m => m.MovieTunnelSummaryModule)
      },
      {
        path: 'end',
        loadChildren: () => import('@blockframes/movie/form/end/end.module').then(m => m.EndTunnelModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(tunnelRoutes)],
  exports: [RouterModule]
})
export class MovieTunnelRoutingModule { }
