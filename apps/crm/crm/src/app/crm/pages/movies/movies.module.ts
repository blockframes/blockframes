import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { MoviesComponent } from './movies.component';
import { BreadCrumbModule } from '../../components/bread-crumb/bread-crumb.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { DashboardModule } from '../../components/dashboard/dashboard.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { JoinPipeModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { MatTooltipModule } from '@angular/material/tooltip';

@NgModule({
  declarations: [MoviesComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    BreadCrumbModule,
    TableModule,
    ImageModule,
    DashboardModule,
    TagModule,
    JoinPipeModule,
    MaxLengthModule,

    MatIconModule,
    MatButtonModule,
    ClipboardModule,
    MatTooltipModule,
    RouterModule.forChild([{ path: '', component: MoviesComponent }])
  ]
})
export class MovieListModule { }
