import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailComponent } from './email.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [EmailComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: EmailComponent }]),
  ]
})
export class EmailModule { }
