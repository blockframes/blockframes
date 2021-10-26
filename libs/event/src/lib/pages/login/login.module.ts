import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventLoginComponent } from './login.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [EventLoginComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: EventLoginComponent }]),
  ]
})
export class LoginModule { }
