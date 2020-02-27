// Angular
import { NgModule } from '@angular/core';
import { RouterModule, NoPreloading } from '@angular/router';
// Components
import { AppGridComponent } from './app-grid/app-grid.component';

const routes = [{
  path: '',
  component: AppGridComponent
}];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      paramsInheritanceStrategy: 'always',
      preloadingStrategy: NoPreloading
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
