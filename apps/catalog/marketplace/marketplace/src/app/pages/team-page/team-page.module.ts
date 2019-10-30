// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Pages
import { TeamPageComponent } from './team-page.component';

// Material
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [TeamPageComponent],
  imports: [
    CommonModule,
    MatCardModule,
    FlexLayoutModule,
    RouterModule.forChild([
      {
        path: '',
        component: TeamPageComponent
      }
    ])
  ]
})
export class TeamPageModule {}
