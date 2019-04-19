import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatCardModule, MatIconModule, MatListModule, MatInputModule, MatButtonModule, MatSelectModule } from '@angular/material';
import { MaterialItemComponent } from './material-item/material-item.component';
import { MaterialFormComponent } from './material-form/material-form.component';
import { MaterialListComponent } from './material-list/material-list.component';
import { MaterialFormDeliveryComponent } from './material-form-delivery/material-form-delivery.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MaterialDeliveryItemComponent } from './material-delivery-item/material-delivery-item.component';

@NgModule({
  declarations: [MaterialItemComponent, MaterialFormComponent, MaterialListComponent, MaterialFormDeliveryComponent, MaterialDeliveryItemComponent,],
  exports: [MaterialItemComponent, MaterialFormComponent, MaterialListComponent, MaterialFormDeliveryComponent, MaterialDeliveryItemComponent],
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
    MatSelectModule,
  ],
})
export class MaterialModule { }
