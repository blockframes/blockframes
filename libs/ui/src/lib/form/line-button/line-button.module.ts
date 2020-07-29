// Angular
import { NgModule } from '@angular/core';

// Component
import { LineButtonComponent } from './line-button.component';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';

@NgModule({
  imports: [
    MatButtonModule,
    MatDividerModule,
    MatIconModule
  ],
  exports: [LineButtonComponent],
  declarations: [LineButtonComponent],
})
export class LineButtonModule { }