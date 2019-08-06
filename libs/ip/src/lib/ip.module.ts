import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ExplorerComponent } from './explorer/explorer.component';
import { AddComponent } from './add/add.component';

// Material

import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

export const ipRoutes: Routes = [
  {
    path: '',
    component: ExplorerComponent,
    data: { org: null }
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    // Material
    MatToolbarModule,
    MatInputModule,
    MatSidenavModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatDialogModule,
    RouterModule.forChild(ipRoutes)
  ],
  entryComponents: [ExplorerComponent, AddComponent],
  declarations: [ExplorerComponent, AddComponent],
  exports: [ExplorerComponent, AddComponent]
})
export class IpModule {}
