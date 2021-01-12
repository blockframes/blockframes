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
import { MatRippleModule } from '@angular/material/core';

// Blockframes
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';
import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { AppBarModule } from '@blockframes/ui/app-bar';

// Component and Directives
import {
  ListPageComponent,
  PageCardDirective,
  PageListItemDirective,
  PageProgressComponent,
  PageSearchDirective,
  PageTitleDirective,
  PageDescriptionTemplateDirective,
  PageEmptyDirective,
  PageAppBarSearchDirective
} from './list-page.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatLayoutModule,
    ImageReferenceModule,
    FlexLayoutModule,
    ImageReferenceModule,
    AppBarModule,

    // Material
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatRippleModule
  ],
  declarations: [
    ListPageComponent,
    PageSearchDirective,
    PageCardDirective,
    PageListItemDirective,
    PageProgressComponent,
    PageTitleDirective,
    PageDescriptionTemplateDirective,
    PageEmptyDirective,
    PageAppBarSearchDirective
  ],
  exports: [
    ListPageComponent,
    PageSearchDirective,
    PageCardDirective,
    PageListItemDirective,
    PageProgressComponent,
    PageTitleDirective,
    PageDescriptionTemplateDirective,
    PageEmptyDirective,
    PageAppBarSearchDirective
  ]
})
export class ListPageModule { }
