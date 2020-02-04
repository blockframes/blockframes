import { FlexLayoutModule } from '@angular/flex-layout';
import { ContractTunnelRoutingModule } from './contract-tunnel-routing.module';
import { ContractTunnelComponent } from './contract-tunnel.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [CommonModule, ContractTunnelRoutingModule, FlexLayoutModule],
  declarations: [ContractTunnelComponent],
  exports: [ContractTunnelComponent]
})
export class ContractTunnelModule {}
