import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia-autocomplete/algolia-autocomplete.module'

// Widgets
import { NotificationWidgetModule } from '@blockframes/notification';
import { SearchWidgetModule } from '@blockframes/ui/search-widget';
import { ProfileWidgetModule } from '@blockframes/user/profile';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';

import { DashboardComponent } from './dashboard.component';
import { MovieOrganizationListGuard, MovieActiveGuard } from '@blockframes/movie';



const routes: Routes = [{
    path: '',
    component: DashboardComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'home'
      },
      {
        path: 'home',   // Home (dashboard if film, welcome if not)
        canActivate: [MovieOrganizationListGuard],
        canDeactivate: [MovieOrganizationListGuard],
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'notification',
        loadChildren: () => import('./notification/notification.module').then(m => m.NotificationModule)
      },
      {
        path: 'import', // Import bulk of movies
        loadChildren: () => import('@blockframes/movie/movie/components/import/import-movie.module')
          .then(m => m.ImportMovieModule)
      },
      {
        path: 'title',
        children: [{
          path: '',
          canActivate: [MovieOrganizationListGuard],
          canDeactivate: [MovieOrganizationListGuard],
          loadChildren: () => import('./title/list/list.module').then(m => m.TitleListModule)
        }, {
          path: ':movieId',
          canActivate: [MovieActiveGuard],
          canDeactivate: [MovieActiveGuard],
          loadChildren: () => import('./title/view/view.module').then(m => m.TitleViewModule)
        }]
      },
    ]
  }
];


@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    ReactiveFormsModule,
    NotificationWidgetModule,
    SearchWidgetModule,
    ProfileWidgetModule,
    AlgoliaAutocompleteModule,
    // Material
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatInputModule,
    MatListModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatBadgeModule,
    RouterModule.forChild(routes)
  ]
})
export class DashboardModule { }
