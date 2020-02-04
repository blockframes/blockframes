import { FlexLayoutModule } from '@angular/flex-layout';
import { CatalogTunnelRoutingModule } from './catalog-tunnel-routing.module';
import { CatalogTunnelComponent } from './catalog-tunnel.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
  imports: [CommonModule, CatalogTunnelRoutingModule, FlexLayoutModule],
  declarations: [CatalogTunnelComponent],
  exports: [CatalogTunnelComponent]
})
export class CatalogTunnelModule {}
