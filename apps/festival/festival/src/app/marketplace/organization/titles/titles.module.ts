import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TitlesComponent } from './titles.component';
import { MovieCardModule } from '@blockframes/ui/movie-card/movie-card.module';



@NgModule({
  declarations: [TitlesComponent],
  imports: [
    CommonModule,
    MovieCardModule,
    RouterModule.forChild([{ path: '', component: TitlesComponent }])
  ]
})
export class OrganizationTitlesModule { }
