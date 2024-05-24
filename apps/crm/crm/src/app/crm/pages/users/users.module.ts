import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { UsersComponent } from './users.component';

import { BreadCrumbModule } from '../../components/bread-crumb/bread-crumb.module';
import { TableModule } from '@blockframes/ui/list/table/table.module';
import { ImageModule } from '@blockframes/media/image/directives/image.module';

import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';

@NgModule({
  declarations: [UsersComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    BreadCrumbModule,
    TableModule,
    ImageModule,
    MatIconModule,
    MatButtonModule,
    ClipboardModule,
    MatMenuModule,
    MatSnackBarModule,
    RouterModule.forChild([{ path: '', component: UsersComponent }])
  ]
})
export class UserListModule {}