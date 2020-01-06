// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Pages
import { TitlesPageComponent } from './titles-page.component';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [TitlesPageComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    RouterModule.forChild([
      {
        path: '',
        component: TitlesPageComponent
      }
    ])
  ]
})
export class TitlesModule {}
