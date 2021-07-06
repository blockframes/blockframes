// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { TagComponent } from './tag.component';


@NgModule({
  imports: [CommonModule],
  exports: [TagComponent],
  declarations: [TagComponent],
})
export class TagModule { }
