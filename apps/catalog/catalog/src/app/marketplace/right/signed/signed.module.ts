import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SignedComponent } from './signed.component';



@NgModule({
  declarations: [SignedComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: SignedComponent }])
  ]
})
export class SignedModule { }
