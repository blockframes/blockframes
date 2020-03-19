import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TitlesComponent } from './titles.component';
import { MovieCardModule } from '@blockframes/ui/movie-card/movie-card.module';
import { MatRippleModule } from '@angular/material/core';



@NgModule({
  declarations: [TitlesComponent],
  imports: [
    CommonModule,
    MovieCardModule,
    MatRippleModule,
    RouterModule.forChild([{ path: '', component: TitlesComponent }])
  ]
})
export class OrganizationTitlesModule { }
