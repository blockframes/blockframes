import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { EditComponent } from './edit.component';

import { EventEditModule as LayoutEventEditModule } from '@blockframes/event/layout/edit/edit.module';

@NgModule({
  declarations: [EditComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LayoutEventEditModule,
    RouterModule.forChild([{ path: '', component: EditComponent }])
  ]
})
export class EventEditModule { }
