import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { MoviesComponent } from './movies.component';
import { BreadCrumbModule } from '../../components/bread-crumb/bread-crumb.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { TagModule } from '@blockframes/ui/tag/tag.module';

import { MatIconModule } from '@angular/material/icon';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { JoinPipeModule, MaxLengthModule } from '@blockframes/utils/pipes';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';

@NgModule({
  declarations: [MoviesComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    BreadCrumbModule,
    TableModule,
    ImageModule,
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
