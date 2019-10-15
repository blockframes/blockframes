import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { MovieEditableComponent } from './pages/movie-editable/movie-editable.component';
import { MovieViewComponent } from './pages/movie-view/movie-view.component';
import { MovieCreateComponent } from './pages/movie-create/movie-create.component';

// Guards
import { MovieOrganizationActiveGuard } from './guards/movie-organization-active.guard';

export const routes: Routes = [

  {
    path: 'create',
    component: MovieCreateComponent
  },
  {
    path: ':movieId',
    canActivate: [MovieOrganizationActiveGuard],
    canDeactivate: [MovieOrganizationActiveGuard],
    children: [
      { path: '', redirectTo: 'view', pathMatch: 'full' },
      { path: 'view', component: MovieViewComponent },
      { path: 'edit', component: MovieEditableComponent }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovieRoutingModule {}
