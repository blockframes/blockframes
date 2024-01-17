import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Component
import { TreeComponent } from './tree.component';

@NgModule({
  imports: [CommonModule],
  declarations: [TreeComponent],
  exports: [TreeComponent]
})
export class TreeModule { }