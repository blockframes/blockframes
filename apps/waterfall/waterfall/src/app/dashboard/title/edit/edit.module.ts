// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Blockframes
import { FormModule } from '../form/form.module';

// Pages
import { EditComponent } from './edit.component';


@NgModule({
  declarations: [EditComponent],
  imports: [
    CommonModule,
    FormModule,

    // Material
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,

    // Routing
    RouterModule.forChild([{ path: '', component: EditComponent }]),
  ],
})
export class EditModule { }
