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
import { StakeholderViewComponent } from '../stakeholder/pages/stakeholder-view/stakeholder-view.component';

// Guards
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
    path: ':movieId',
    canActivate: [MovieActiveGuard],
    canDeactivate: [MovieActiveGuard],
    children: [
      { path: '', redirectTo: 'view', pathMatch: 'full' },
      { path: 'view', component: MovieViewComponent },
      { path: 'teamwork', component: StakeholderViewComponent },
      {
        path: 'edit',
        component: ContainerComponent,
        children: [
          { path: '', redirectTo: 'main', pathMatch: 'full' },
          { path: 'main',component: FormMainComponent },
          { path: 'story',component: FormStoryComponent },
          { path: 'team',component: FormTeamComponent },
          { path: 'promo',component: FormPromotionalComponent },
        ]
      },
    ]
  }
]

@NgModule({
  imports : [RouterModule.forChild(routes)],
  exports : [RouterModule]
})
export class MovieRoutingModule { }
