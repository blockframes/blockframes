// Angular
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// BlockFrames
import { OrgRequestAccessComponent } from './request-access.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    MatIconModule,
    RouterModule.forChild([{ path: '', component: OrgRequestAccessComponent }])
  ],
  declarations: [OrgRequestAccessComponent],
  exports: [OrgRequestAccessComponent]
})
export class OrgRequestAccessModule {}
