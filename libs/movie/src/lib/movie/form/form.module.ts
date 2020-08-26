import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { PasswordConfirmModule } from '@blockframes/ui/form';
import { UploadModule } from '@blockframes/media/components/upload/upload.module';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CropperModule } from '@blockframes/media/components/cropper/cropper.module';

// Forms Modules
import { MovieFormFestivalPrizesModule } from './festival-prizes/festival-prizes.module';
import { MovieFormSalesCastModule } from './sales-cast/sales-cast.module';
import { MovieFormVersionInfoModule } from './version-info/version-info.module';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FlexLayoutModule,

    // Material
    MatAutocompleteModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatChipsModule,
    NgxMatSelectSearchModule,
    MatTabsModule,
    MatCheckboxModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatDividerModule,
    MatSlideToggleModule,

    // Librairies
    PasswordConfirmModule,
    UploadModule,
    CropperModule,

    // Forms
    MovieFormFestivalPrizesModule,
    MovieFormSalesCastModule,
    MovieFormVersionInfoModule,
  ]
})
export class MovieFormModule {}
