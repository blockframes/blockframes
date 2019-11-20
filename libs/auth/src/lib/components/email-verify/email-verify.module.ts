import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EmailVerifyComponent } from './email-verify.component';

// Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';

const material = [
  MatIconModule,
  MatButtonModule,
  MatTooltipModule,
  MatBadgeModule
]


@NgModule({
  imports: [CommonModule, ...material],
  declarations: [EmailVerifyComponent],
  exports: [EmailVerifyComponent],
})
export class EmailVerifyModule {}
