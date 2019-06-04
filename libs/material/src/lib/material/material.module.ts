// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material
import {
  MatFormFieldModule,
  MatCardModule,
  MatIconModule,
  MatListModule,
  MatInputModule,
  MatButtonModule,
  MatSelectModule,
  MatCheckboxModule
} from '@angular/material';

// Components
import { MaterialTemplateItemComponent } from './material-template-item/material-template-item.component';
import { MaterialTemplateFormComponent } from './material-template-form/material-template-form.component';
import { MaterialCategoryListComponent } from './material-category-list/material-category-list.component';
import { MaterialDeliveryFormComponent } from './material-delivery-form/material-delivery-form.component';
import { MaterialDeliveryItemComponent } from './material-delivery-item/material-delivery-item.component';
import { MaterialDeliveryAddFormComponent } from './material-delivery-form/material-delivery-add-form.component';
import { MaterialTemplateAddFormComponent } from './material-template-form/material-template-add-form.component';

@NgModule({
  declarations: [
    MaterialTemplateItemComponent,
    MaterialTemplateFormComponent,
    MaterialTemplateAddFormComponent,
    MaterialCategoryListComponent,
    MaterialDeliveryFormComponent,
    MaterialDeliveryItemComponent,
    MaterialDeliveryAddFormComponent,
  ],
  exports: [
    MaterialTemplateItemComponent,
    MaterialTemplateFormComponent,
    MaterialTemplateAddFormComponent,
    MaterialCategoryListComponent,
    MaterialDeliveryFormComponent,
    MaterialDeliveryItemComponent,
    MaterialDeliveryAddFormComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    FlexLayoutModule,

    // Material
    MatCardModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
  ]
})
export class MaterialModule {}
