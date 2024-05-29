// Angular
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatRippleModule } from '@angular/material/core';

// Blockframes
import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { LogoSpinnerModule } from '@blockframes/ui/logo-spinner/logo-spinner.module';

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
  PdfExportDirective,
  EventsExportDirective
} from './list-page.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ImageModule,
    FlexLayoutModule,
    AppBarModule,
    LogoSpinnerModule,

    // Material
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
    PdfExportDirective,
    EventsExportDirective
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
    PdfExportDirective,
    EventsExportDirective
  ]
})
export class ListPageModule { }
