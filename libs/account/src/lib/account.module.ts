import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountWidgetComponent } from './account-widget/account-widget.component';

// Material
import { MatMenuModule } from '@angular/material/menu';


@NgModule({
  imports: [
    CommonModule,
    MatMenuModule,
  ],
  entryComponents: [AccountWidgetComponent],
  declarations: [AccountWidgetComponent],
  exports: [AccountWidgetComponent]
})
export class AccountModule {}
