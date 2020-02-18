import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { JoinPipe } from './join.pipe';

@NgModule({
  declarations: [JoinPipe],
  imports: [CommonModule],
  exports: [JoinPipe]
})
export class JoinPipeModule {}
