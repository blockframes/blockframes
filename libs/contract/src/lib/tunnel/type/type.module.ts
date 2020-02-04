import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TunnelTypeComponent } from './type.component';

@NgModule({
  imports: [CommonModule, RouterModule.forChild([{ path: '', component: TunnelTypeComponent }])],
  declarations: [TunnelTypeComponent]
})
export class TunnelTypeModule {}
