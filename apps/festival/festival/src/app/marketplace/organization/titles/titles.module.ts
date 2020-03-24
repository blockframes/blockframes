import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TitlesComponent } from './titles.component';
import { MovieCardModule } from '@blockframes/ui/movie-card/movie-card.module';
import { MatRippleModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';



@NgModule({
  declarations: [TitlesComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieCardModule,
    MatRippleModule,
    RouterModule.forChild([{ path: '', component: TitlesComponent }])
  ]
})
export class OrganizationTitlesModule { }
