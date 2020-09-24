import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

import { ImageReferenceModule } from '@blockframes/media/directives/image-reference/image-reference.module';
import { DisplayNameModule, TranslateSlugModule } from '@blockframes/utils/pipes';
import { AppBarModule } from '@blockframes/ui/app-bar';
import { MatLayoutModule } from '@blockframes/ui/layout/layout.module';

import {
  TitleListComponent,
  TitleCardDirective,
  TitleListItemDirective,
  TitleSortDirective,
  TitleSearchDirective,
  TitleAppBarSearchDirective,
  TitleProgressDirective,
} from './title-list.component'

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatListModule } from '@angular/material/list';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    TitleListComponent,
    TitleCardDirective,
    TitleListItemDirective,
    TitleSortDirective,
    TitleSearchDirective,
    TitleAppBarSearchDirective,
    TitleProgressDirective
  ],
  exports: [
    TitleListComponent,
    TitleCardDirective,
    TitleListItemDirective,
    TitleSortDirective,
    TitleSearchDirective,
    TitleAppBarSearchDirective,
    TitleProgressDirective
  ],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FlexLayoutModule,
    ImageReferenceModule,
    DisplayNameModule,
    TranslateSlugModule,
    AppBarModule,
    MatLayoutModule,

    // Material
    MatIconModule,
    MatDividerModule,
    MatMenuModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatAutocompleteModule,
    MatListModule,
    MatChipsModule,
    MatCardModule,
    MatSelectModule,
    MatDatepickerModule,
    MatOptionModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
  ]
})
export class TitleListLayoutModule { }
