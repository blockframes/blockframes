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
import { MaterialTemplateItemComponent } from './components/material-template-item/material-template-item.component';
import { MaterialTemplateFormComponent } from './components/material-template-form/material-template-form.component';
import { MaterialCategoryRepertoryComponent } from './components/material-category-repertory/material-category-repertory.component';
import { MaterialDeliveryFormComponent } from './components/material-delivery-form/material-delivery-form.component';
import { MaterialDeliveryItemComponent } from './components/material-delivery-item/material-delivery-item.component';
import { MaterialDeliveryAddFormComponent } from './components/material-delivery-form/material-delivery-add-form.component';
import { MaterialTemplateAddFormComponent } from './components/material-template-form/material-template-add-form.component';

@NgModule({
  declarations: [
    MaterialTemplateItemComponent,
    MaterialTemplateFormComponent,
    MaterialTemplateAddFormComponent,
    MaterialCategoryRepertoryComponent,
    MaterialDeliveryFormComponent,
    MaterialDeliveryItemComponent,
    MaterialDeliveryAddFormComponent,
  ],
  exports: [
    MaterialTemplateItemComponent,
    MaterialTemplateFormComponent,
    MaterialTemplateAddFormComponent,
    MaterialCategoryRepertoryComponent,
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
