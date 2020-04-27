import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RuntimePipe } from './runtime.pipe';

@NgModule({
  imports: [CommonModule],
  exports: [RuntimePipe],
  declarations: [RuntimePipe],
})
export class RuntimeModule { }
