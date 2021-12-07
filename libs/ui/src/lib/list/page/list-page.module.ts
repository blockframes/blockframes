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
import { ImageModule } from '@blockframes/media/image/directives/image.module';
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
  PageAppBarSearchDirective,
  PdfExportDirective
} from './list-page.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    MatLayoutModule,
    ImageModule,
    FlexLayoutModule,
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
    PageAppBarSearchDirective,
    PdfExportDirective
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
    PageAppBarSearchDirective,
    PdfExportDirective
  ]
})
export class ListPageModule { }
