// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatSelectModule } from '@angular/material/select';

// Components
import { MaterialDeliveryFormComponent } from './components/material-delivery-form/material-delivery-form.component';
import { MaterialDeliveryItemComponent } from './components/material-delivery-item/material-delivery-item.component';
import { MaterialDeliveryAddFormComponent } from './components/material-delivery-form/material-delivery-add-form.component';

@NgModule({
  declarations: [
    MaterialDeliveryFormComponent,
    MaterialDeliveryItemComponent,
    MaterialDeliveryAddFormComponent,
  ],
  exports: [
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
