import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TermFormComponent } from './term-form.component';
import { RouterModule } from '@angular/router';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from "@angular/material/button";

import { TermFormModule as FormModule } from '@blockframes/contract/term/components/form/form.module';

@NgModule({
  declarations: [TermFormComponent],
  imports: [
    CommonModule,
    FormModule,

    // Material
    MatIconModule,
    MatButtonModule,

    RouterModule.forChild([{ path: '', component: TermFormComponent }])
  ]
})
export class TermFormModule { }
