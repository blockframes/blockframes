import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventLoginComponent } from './login.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [EventLoginComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    RouterModule.forChild([{ path: '', component: EventLoginComponent }]),
  ]
})
export class LoginModule { }
