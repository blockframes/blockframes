import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { EventEditComponent } from './edit.component';
import { EditDetailsModule } from '../../form/edit-details/edit-details.module';
import { AppBarModule } from '@blockframes/ui/app-bar';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  declarations: [EventEditComponent],
  exports: [EventEditComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    RouterModule,
    EditDetailsModule,
    AppBarModule,

    // Material
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatTabsModule
  ]
})
export class EventEditModule { }
