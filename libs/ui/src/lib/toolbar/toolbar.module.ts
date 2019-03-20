import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';

import { OrganizationModule} from '@blockframes/organization';
import { AuthModule} from '@blockframes/auth';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list';

@NgModule({
  imports: [
    CommonModule,
    MatIconModule,
    MatToolbarModule,
    OrganizationModule,
    AuthModule,
    MatMenuModule,
    MatButtonModule,
    MatDividerModule,
    MatListModule
  ],
  declarations: [HeaderComponent],
  exports: [HeaderComponent]
})
export class ToolbarModule {}
