import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SessionComponent } from './session.component';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [SessionComponent],
  imports: [
    CommonModule,
    RouterModule.forChild([{ path: '', component: SessionComponent }])
  ]
})
export class SessionModule { }
