// Angular
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Components
import { LayoutComponent } from './layout/layout.component';

// Guards
import { CatalogMovieActiveGuard } from './guards/catalog-movie-active.guard';
import { AuthGuard } from '@blockframes/auth';
import { PermissionsGuard, OrganizationGuard } from '@blockframes/organization';
import { MovieEmptyComponent } from '@blockframes/movie/movie/components/movie-empty/movie-empty.component';
import { CatalogBasketGuard } from './guards/catalog-basket-list.guard';
import { MovieCollectionGuard } from '@blockframes/movie';

export const routes: Routes = [
  { path: '', redirectTo: 'layout', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('@blockframes/auth').then(m => m.AuthModule)
  },
  {
    path: 'layout',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    canDeactivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'o',
        pathMatch: 'full'
      },
      {
        // The redirection route when user has no organization
        path: 'organization',
        loadChildren: () => import('@blockframes/organization').then(m => m.NoOrganizationModule)
      },
      {
        path: 'o',
        canActivate: [PermissionsGuard, OrganizationGuard],
        canDeactivate: [PermissionsGuard, OrganizationGuard],
        children: [
          {
            path: '',
            redirectTo: 'catalog',
            pathMatch: 'full'
          },
          {
            path: 'no-movies',
            component: MovieEmptyComponent
          },
          {
            path: 'organization',
            loadChildren: () => import('@blockframes/organization').then(m => m.OrganizationModule)
          },
          {
            path: 'account',
            loadChildren: () => import('@blockframes/account').then(m => m.AccountModule)
          },
          {
            path: 'home',
            loadChildren: () => import('@blockframes/movie').then(m => m.MovieModule)
          },
          // APP SPECIFIC
          {
            path: 'catalog',
            children: [
              { path: '', redirectTo: 'home', pathMatch: 'full' },
              {
                path: 'home',
                canActivate: [MovieCollectionGuard],
                canDeactivate: [MovieCollectionGuard],
                loadChildren: () =>
                  import('./movie/home/home.module').then(m => m.MarketplaceHomeModule)
              },
              {
                path: 'search',
                canActivate: [MovieCollectionGuard],
                canDeactivate: [MovieCollectionGuard],
                loadChildren: () =>
                  import('./movie/search/search.module').then(m => m.MarketplaceSearchModule)
              },
              {
                path: 'wishlist',
                canActivate: [CatalogBasketGuard, MovieCollectionGuard],
                canDeactivate: [CatalogBasketGuard, MovieCollectionGuard],
                loadChildren: () =>
                  import('./movie/wishlist/wishlist.module').then(m => m.WishlistModule)
              },
              {
                path: 'selection',
                canActivate: [CatalogBasketGuard, MovieCollectionGuard],
                canDeactivate: [CatalogBasketGuard, MovieCollectionGuard],
                children: [
                  {
                    path: '',
                    redirectTo: 'overview',
                    pathMatch: 'full'
                  },
                  {
                    path: 'overview',
                    loadChildren: () =>
                      import('./movie/selection/selection.module').then(m => m.SelectionModule)
                  },
                  {
                    path: 'success',
                    loadChildren: () =>
                      import('./components/completion.module').then(m => m.CatalogCompletionModule)
                  }
                ]
              },
              {
                path: ':movieId',
                canActivate: [CatalogMovieActiveGuard],
                canDeactivate: [CatalogMovieActiveGuard],
                children: [
                  { path: '', redirectTo: 'view', pathMatch: 'full' },
                  {
                    path: 'view',
                    loadChildren: () =>
                      import('./movie/view/view.module').then(m => m.MovieViewModule)
                  },
                  {
                    path: 'create',
                    loadChildren: () =>
                      import('./distribution-right/create/create.module').then(
                        m => m.DistributionRightCreateModule
                      )
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: 'not-found',
    loadChildren: () => import('@blockframes/ui').then(m => m.ErrorNotFoundModule)
  },
  {
    path: '**',
    redirectTo: 'not-found'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always'
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
