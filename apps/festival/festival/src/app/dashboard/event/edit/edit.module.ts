import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EditComponent } from './edit.component';
import { DisplayNameModule } from '@blockframes/utils/pipes';

import { EventEditModule as LayoutEventEditModule } from '@blockframes/event/layout/edit/edit.module';
// Material
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [EditComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    LayoutEventEditModule,
    DisplayNameModule,
    // Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    RouterModule.forChild([{ path: '', component: EditComponent }])
  ]
})
export class EventEditModule { }
