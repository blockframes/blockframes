import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmailVerifyComponent } from './email-verify.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [EmailVerifyComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: EmailVerifyComponent }]),
  ]
})
export class EmailVerifyModule { }
