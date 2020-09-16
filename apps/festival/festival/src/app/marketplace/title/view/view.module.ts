// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { MarketplaceMovieViewComponent } from './view.component';
import { MovieShellModule } from '@blockframes/movie/marketplace/shell/shell.module';
import { RouterModule } from '@angular/router';

const routes = [
  {
    path: '',
    component: MarketplaceMovieViewComponent,
    children: [
      {
        path: '',
        redirectTo: 'main',
        pathMatch: 'full'
      },
      {
        path: 'main',
        loadChildren: () => import('@blockframes/movie/marketplace/main/main.module').then(m => m.MovieMainModule)
      },
      {
        path: 'artistic',
        loadChildren: () => import('@blockframes/movie/marketplace/artistic/artistic.module').then(m => m.MovieArtisticModule)
      },
      {
        path: 'additional',
        loadChildren: () => import('@blockframes/movie/marketplace/additional/additional.module').then(m => m.MovieAdditionalModule)
      },
      {
        path: 'finance',
        loadChildren: () => import('../finance/finance.module').then(m => m.MarketplaceMovieFinanceModule)
      },
      {
        path: 'screenings',
        loadChildren: () => import('../screening/screening.module').then(m => m.ScreeningModule)
      }
    ]
  }
];

@NgModule({
  declarations: [MarketplaceMovieViewComponent],
  imports: [
    CommonModule,
    MovieShellModule,
    RouterModule.forChild(routes)
  ]
})
export class MovieViewModule {}
