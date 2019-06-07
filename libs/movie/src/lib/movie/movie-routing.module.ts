import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// Components
import { ContainerComponent } from './form/container.component';
import { HomeComponent } from './home/home.component';
import { ViewComponent } from './view/view.component';
import { TitleFormComponent } from './title-form/title-form.component';

// Guards
import { StakeholderViewComponent } from '../stakeholder/pages/stakeholder-view/stakeholder-view.component';
import { MovieActiveGuard } from './guards/movie-active.guard';


export const routes: Routes = [
  { path: '',  component: HomeComponent },

  // MovieGuard: set active the Movie id in Akita

  {
    path: 'form',
    component: ContainerComponent,
  },
  {
    path: 'form/:movieId',
    component: ContainerComponent,
    canActivate: [MovieActiveGuard],
  },
  {
    path: 'form/:movieId/teamwork',
    component: StakeholderViewComponent,
    canActivate: [MovieActiveGuard],
  },
  {
    path: 'movie/:movieId',
    component: ViewComponent,
    canActivate: [MovieActiveGuard],
  },
  {
    path: 'dev',
    component: TitleFormComponent,
  },
]

@NgModule({
  imports : [RouterModule.forChild(routes)],
  exports : [RouterModule]
})
export class MovieRoutingModule { }
