import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { MovieEditableComponent } from './pages/movie-editable/movie-editable.component';
import { MovieViewComponent } from './pages/movie-view/movie-view.component';
import { MovieFormStoryComponent } from './components/movie-form/movie-form-story/movie-form-story.component';
import { MovieFormTeamComponent } from './components/movie-form/movie-form-team/movie-form-team.component';
import { MovieFormPromotionalComponent } from './components/movie-form/movie-form-promotional/movie-form-promotional.component';
import { StakeholderViewComponent } from '../stakeholder/pages/stakeholder-view/stakeholder-view.component';
import { MovieListComponent } from './pages/movie-list/movie-list.component';
import { MovieCreateComponent } from './pages/movie-create/movie-create.component';
import { ImportStepperComponent } from './components/import/import-stepper/import-stepper.component';

// Guards
import { MovieActiveGuard } from './guards/movie-active.guard';
import { MovieListGuard } from './guards/movie-list.guard';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'
  },
  {
    path: 'create',
    component: MovieCreateComponent
  },
  {
    path: 'list',
    component: MovieListComponent,
    canActivate: [MovieListGuard],
    canDeactivate: [MovieListGuard],
  },
  {
    path: 'import',
    component: ImportStepperComponent,
    canActivate: [MovieListGuard], // @todo not working if user does not have a movie in their list
    canDeactivate: [MovieListGuard],
  },
  {
    path: ':movieId',
    canActivate: [MovieActiveGuard],
    canDeactivate: [MovieActiveGuard],
    children: [
      { path: '', redirectTo: 'view', pathMatch: 'full' },
      { path: 'view', component: MovieViewComponent },
      { path: 'teamwork', component: StakeholderViewComponent },
      {
        path: 'edit', //todo remove
        component: MovieEditableComponent,
        children: [
          { path: '', redirectTo: 'story', pathMatch: 'full' },
          { path: 'story', component: MovieFormStoryComponent },
          { path: 'team', component: MovieFormTeamComponent },
          { path: 'promo', component: MovieFormPromotionalComponent }
        ]
      },
      {
        path: 'edit-new/:sectionId', //@todo rename
        component: MovieEditableComponent,
      }
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MovieRoutingModule {}
