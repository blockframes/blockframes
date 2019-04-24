// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material
import {
  MatFormFieldModule,
  MatCardModule,
  MatIconModule,
  MatListModule,
  MatInputModule,
  MatButtonModule,
  MatSelectModule
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

// Components
import { MaterialTemplateItemComponent } from './material-template-item/material-template-item.component';
import { MaterialTemplateFormComponent } from './material-template-form/material-template-form.component';
import { MaterialListComponent } from './material-list/material-list.component';
import { MaterialDeliveryFormComponent } from './material-delivery-form/material-delivery-form.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MaterialDeliveryItemComponent } from './material-delivery-item/material-delivery-item.component';
import { EditableComponent } from './directives/editable.component';
import { ViewModeDirective } from './directives/view-mode-directive';
import { EditModeDirective } from './directives/edit-mode-directive';
import { MaterialDeliveryAddFormComponent } from './material-delivery-form/material-delivery-add-form.component';
import { MaterialTemplateAddFormComponent } from './material-template-form/material-template-add-form.component';

@NgModule({
  declarations: [
    MaterialTemplateItemComponent,
    MaterialTemplateFormComponent,
    MaterialTemplateAddFormComponent,
    MaterialListComponent,
    MaterialDeliveryFormComponent,
    MaterialDeliveryItemComponent,
    MaterialDeliveryAddFormComponent,
    EditableComponent,
    ViewModeDirective,
    EditModeDirective,
  ],
  exports: [
    MaterialTemplateItemComponent,
    MaterialTemplateFormComponent,
    MaterialTemplateAddFormComponent,
    MaterialListComponent,
    MaterialDeliveryFormComponent,
    MaterialDeliveryItemComponent,
    MaterialDeliveryAddFormComponent,
    EditableComponent,
    ViewModeDirective,
    EditModeDirective,
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    FlexLayoutModule,
    MatIconModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatListModule,
    MatButtonModule,
    MatSelectModule
  ]
})
export class MaterialModule {}
