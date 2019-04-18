import { NgModule } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';

@NgModule({
  exports: [MatToolbarModule, MatCardModule, MatListModule, MatSidenavModule, MatTabsModule],
})
export class MaterialLayoutModule {}
