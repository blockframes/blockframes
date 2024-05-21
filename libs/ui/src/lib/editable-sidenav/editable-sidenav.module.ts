import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditableSidenavComponent } from './editable-sidenav.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';

@NgModule({
  declarations: [EditableSidenavComponent],
  imports: [
    CommonModule,
    MatSidenavModule,
    FlexLayoutModule,
    MatIconModule,
    MatDividerModule,
    MatButtonModule,
    MatCardModule
  ],
  exports: [EditableSidenavComponent]
})
export class EditableSidenavModule {}
