import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Modules
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { StaticSelectModule } from '@blockframes/ui/static-autocomplete/select/static-select.module';
import { ToLabelModule } from "@blockframes/utils/pipes/to-label.pipe";

// Components
import { EditTitleComponent } from './edit-title.component';
import { MatSelectModule } from '@angular/material/select';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatDialogModule,
    MatButtonModule,
    MatSelectModule,
    StaticSelectModule,
    ToLabelModule
  ],
  declarations: [
    EditTitleComponent,
  ],
  exports: [
    EditTitleComponent
  ]
})
export class EditTitleModule { }
