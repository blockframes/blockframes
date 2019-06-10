import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ContainerComponent } from './form/container.component';
import { HomeComponent } from './home/home.component';
import { MovieViewComponent } from './pages/movie-view/movie-view.component';
import { FormMainComponent } from './form/form.main.component';
import { FormStoryComponent } from './form/form.story.component';
import { FormTeamComponent } from './form/form.team.component';
import { FormPromotionalComponent } from './form/form.promotional.component';

// Guards
import { StakeholderViewComponent } from '../stakeholder/pages/stakeholder-view/stakeholder-view.component';
import { MovieActiveGuard } from './guards/movie-active.guard';
import { MovieListGuard } from './guards/movie-list.guard';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [MovieListGuard],
    canDeactivate: [MovieListGuard],
  },
  {
    path: 'form/:movieId',
    component: ContainerComponent,
    canActivate: [MovieActiveGuard],
    children: [
      { path: '', redirectTo: 'main', pathMatch: 'full' },
      { path: 'main',component: FormMainComponent },
      { path: 'story',component: FormStoryComponent },
      { path: 'team',component: FormTeamComponent },
      { path: 'promo',component: FormPromotionalComponent },
    ]
  },
  {
    path: 'form/:movieId/teamwork',
    component: StakeholderViewComponent,
    canActivate: [MovieActiveGuard],
    canDeactivate: [MovieActiveGuard]
  },
  {
    path: 'movie/:movieId',
    component: MovieViewComponent,
    canActivate: [MovieActiveGuard],
    canDeactivate: [MovieActiveGuard]
  },
]

@NgModule({
  imports : [RouterModule.forChild(routes)],
  exports : [RouterModule]
})
export class MovieRoutingModule { }
