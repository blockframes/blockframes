import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventIdenityComponent } from './identity.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [EventIdenityComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: EventIdenityComponent }]),
  ]
})
export class IdentityModule { }
