import { NgModule } from '@angular/core';
import { MessageComponent } from './message.component';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    CommonModule,
    RouterModule
  ],
  declarations: [MessageComponent],
  exports: [MessageComponent]
})
export class MessageModule { }
