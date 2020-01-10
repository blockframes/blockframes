import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
// Material
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

import { UploadModule, UiFormModule } from '@blockframes/ui';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CropperModule } from '@blockframes/ui/media/cropper/cropper.module';

// components
import { MovieFormMainComponent } from './main/main.component';
import { MovieFormPromotionalElementsComponent } from './promotional-elements/promotional-elements.component';
import { MovieFormPromotionalDescriptionComponent } from './promotional-description/promotional-description.component';
import { MovieFormSalesCastComponent } from './sales-cast/sales-cast.component';
import { MovieFormStoryComponent } from './story/story.component';
import { MovieFormRootComponent } from './root/root.component';
// import { MovieFormVersionInfoComponent } from './version-info/version-info.component';
import { MovieFormFestivalPrizesComponent } from './festival-prizes/festival-prizes.component';
import { MovieFormSalesAgentDealComponent } from './sales-agent-deal/sales-agent-deal.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,

    // Material
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

    // Librairies
    UiFormModule,
    UploadModule,
    CropperModule,
  ],
  declarations: [
    MovieFormRootComponent,
    MovieFormMainComponent,
    MovieFormPromotionalElementsComponent,
    MovieFormPromotionalDescriptionComponent,
    MovieFormStoryComponent,
    MovieFormSalesCastComponent,
    MovieFormFestivalPrizesComponent,
    MovieFormSalesAgentDealComponent,
  ],
  exports: [
    MovieFormRootComponent
  ]
})
export class MovieFormModule {}
