import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MatFormFieldModule,
  MatInputModule,
  MatIconModule,
  MatButtonModule,
  MatSelectModule,
  MatChipsModule,
  MatCardModule,
  MatTabsModule
} from '@angular/material';
import { UploadModule, UiFormModule } from '@blockframes/ui';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// components
import { MovieFormMainComponent } from './main/main.component';
import { MovieFormPromotionalElementsComponent } from './promotional-elements/promotional-elements.component';
import { MovieFormPromotionalDescriptionComponent } from './promotional-description/promotional-description.component';
import { MovieFormSalesCastComponent } from './sales-cast/sales-cast.component';
import { MovieFormStoryComponent } from './story/story.component';
import { MovieFormRootComponent } from './root/root.component';



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

    // Librairies
    UiFormModule,
    UploadModule,
  ],
  declarations: [
    MovieFormRootComponent,
    MovieFormMainComponent,
    MovieFormPromotionalElementsComponent,
    MovieFormPromotionalDescriptionComponent,
    MovieFormStoryComponent,
    MovieFormSalesCastComponent,
  ],
  exports: [
    MovieFormRootComponent
  ]
})
export class MovieFormModule {}
