import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule, MatCardModule, MatIconModule, MatListModule, MatInputModule, MatButtonModule, MatSelectModule } from '@angular/material';
import { MaterialTemplateItemComponent } from './material-template-item/material-template-item.component';
import { MaterialTemplateFormComponent } from './material-template-form/material-template-form.component';
import { MaterialListComponent } from './material-list/material-list.component';
import { MaterialDeliveryFormComponent } from './material-delivery-form/material-delivery-form.component';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { RouterModule } from '@angular/router';
import { MaterialDeliveryItemComponent } from './material-delivery-item/material-delivery-item.component';

@NgModule({
  declarations: [MaterialTemplateItemComponent, MaterialTemplateFormComponent, MaterialListComponent, MaterialDeliveryFormComponent, MaterialDeliveryItemComponent,],
  exports: [MaterialTemplateItemComponent, MaterialTemplateFormComponent, MaterialListComponent, MaterialDeliveryFormComponent, MaterialDeliveryItemComponent],
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
