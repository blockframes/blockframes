// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

//Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';

// Libraries
import { FlexLayoutModule } from '@angular/flex-layout';

// Pages
import { CatalogDashboardHomeComponent } from './dashboard-home.component';

// Modules
import { MovieCreateModule } from '@blockframes/movie/movie/components/movie-create/movie-create.module';
import { MovieCardModule } from '@blockframes/ui/movie-card/movie-card.module';
import { MovieActiveGuard } from '@blockframes/movie/movie/guards/movie-active.guard';
import { MovieOrganizationListGuard } from '@blockframes/movie/movie/guards/movie-organization-list.guard';



@NgModule({
  declarations: [CatalogDashboardHomeComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieCardModule,
    MovieCreateModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatInputModule,
    MatMenuModule,
    MatDialogModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        canActivate: [MovieOrganizationListGuard],
        canDeactivate: [MovieOrganizationListGuard],
        component: CatalogDashboardHomeComponent
      },
      {
        path: ':movieId',
        canActivate: [MovieActiveGuard],
        canDeactivate: [MovieActiveGuard],
        loadChildren: () => import('@blockframes/movie').then(m => m.MovieModule)
      }
    ])
  ]
})
export class DashboardHomeModule {}
