// Angular
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Blockframes
import { FormModule } from '../form/form.module';

// Pages
import { CreateComponent } from './create.component';


@NgModule({
  declarations: [CreateComponent],
  imports: [
    CommonModule,
    FormModule,

    // Material
    MatIconModule,
    MatButtonModule,

    // Routing
    RouterModule.forChild([{ path: '', component: CreateComponent }]),
  ],
})
export class CreateModule { }
