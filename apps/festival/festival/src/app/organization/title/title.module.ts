import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TitleComponent } from './title.component';
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { MatRippleModule } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';

import { RequestScreeningModule } from '@blockframes/event/components/request-screening/request-screening.module';

@NgModule({
  declarations: [TitleComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieCardModule,
    MatRippleModule,
    RouterModule.forChild([{ path: '', component: TitleComponent }]),
    RequestScreeningModule
  ]
})
export class OrganizationTitleModule { }
