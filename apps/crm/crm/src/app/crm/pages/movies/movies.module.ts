import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MoviesComponent } from './movies.component';

import { BreadCrumbModule } from '../../components/bread-crumb/bread-crumb.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { OrgNameModule } from '@blockframes/organization/pipes/org-name.pipe';
import { DashboardModule } from '../../components/dashboard/dashboard.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';


@NgModule({
  declarations: [MoviesComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    BreadCrumbModule,
    TableModule,
    ImageModule,
    OrgNameModule,
    DashboardModule,
    TagModule,
    MatIconModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: MoviesComponent }])
  ]
})
export class MovieListModule {}