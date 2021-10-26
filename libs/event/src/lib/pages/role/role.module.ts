import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventRoleComponent } from './role.component';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';

// Material
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  declarations: [EventRoleComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatButtonModule,
    RouterModule.forChild([{ path: '', component: EventRoleComponent }]),
  ]
})
export class RoleModule { }
