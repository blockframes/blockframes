import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TunnelStartComponent } from './start.component';

@NgModule({
  imports: [CommonModule, RouterModule.forChild([{ path: '', component: TunnelStartComponent }])],
  declarations: [TunnelStartComponent]
})
export class TunnelStartModule {}
