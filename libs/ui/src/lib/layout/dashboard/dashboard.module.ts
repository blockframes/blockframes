import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ImageModule } from '@blockframes/media/image/directives/image.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module'
import { UploadWidgetModule } from '@blockframes/media/file/upload-widget/upload-widget.module';

import { DashboardComponent } from './dashboard.component';

import { AppBarModule } from '../../app-bar';
import { AppLogoModule } from '../app-logo/app-logo.module';
import { FooterModule } from '../footer/footer.module';

// Widgets
import { AuthWidgetModule } from '@blockframes/auth/components/widget/widget.module';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';

@NgModule({
  declarations: [DashboardComponent],
  exports: [DashboardComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule,
    ReactiveFormsModule,
    AuthWidgetModule,
    AlgoliaAutocompleteModule,
    ImageModule,
    AppBarModule,
    ScrollingModule,
    AppLogoModule,
    FooterModule,
    UploadWidgetModule,

    // Material
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatInputModule,
    MatIconModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatBadgeModule,
  ]
})
export class DashboardLayoutModule { }
