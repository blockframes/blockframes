// Angular
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pages
import { ImdbApiTestComponent } from './imdb-api-test.component';

@NgModule({
  declarations: [ImdbApiTestComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        component: ImdbApiTestComponent
      }
    ])
  ]
})
export class ImdbApiTestModule {}
