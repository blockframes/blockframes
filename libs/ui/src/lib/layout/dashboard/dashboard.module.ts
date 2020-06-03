import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ScrollingModule } from '@angular/cdk/scrolling';

import { ImageReferenceModule } from '@blockframes/ui/media/image-reference/image-reference.module';
import { AlgoliaAutocompleteModule } from '@blockframes/ui/algolia/autocomplete/algolia-autocomplete.module'

import { DashboardComponent } from './dashboard.component';

import { AppBarModule } from '../../app-bar';
import { AppLogoModule } from '../app-logo/app-logo.module';

// Widgets
import { SearchWidgetModule } from '@blockframes/ui/search-widget';
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
    SearchWidgetModule,
    AuthWidgetModule,
    AlgoliaAutocompleteModule,
    ImageReferenceModule,
    AppBarModule,
    ScrollingModule,
    AppLogoModule,
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
