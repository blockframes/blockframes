import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TitleComponent } from './title.component';
import { MovieCardModule } from '@blockframes/movie/components/card/card.module';
import { CampaignPipeModule } from '@blockframes/campaign/pipes';

import { MatRippleModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FlexLayoutModule } from '@angular/flex-layout';



@NgModule({
  declarations: [TitleComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MovieCardModule,
    CampaignPipeModule,
    MatRippleModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: TitleComponent }])
  ]
})
export class OrganizationTitleModule { }
