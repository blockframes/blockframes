// Angular
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatButtonModule } from '@angular/material/button';

// Blockframes
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';

// Component and Directives
import {
  ListPageComponent,
  PageCardDirective,
  PageListItemDirective,
  PageProgressDirective,
  PageSearchDirective,
  PageSortDirective
} from './list-page.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatLayoutModule,
    ImageReferenceModule,
    FlexLayoutModule,

    // Material
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule
  ],
  declarations: [
    ListPageComponent,
    PageSortDirective,
    PageSearchDirective,
    PageCardDirective,
    PageListItemDirective,
    PageProgressDirective
  ],
  exports: [
    ListPageComponent,
    PageSortDirective,
    PageSearchDirective,
    PageCardDirective,
    PageListItemDirective,
    PageProgressDirective
  ]
})
export class ListPageModule { }
