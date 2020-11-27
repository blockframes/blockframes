import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DoorbellBottomSheetComponent } from './doorbell.component';
import { DisplayUserModule } from '@blockframes/utils/pipes/display-user.pipe';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';

@NgModule({
  declarations: [DoorbellBottomSheetComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    DisplayUserModule,
    MatButtonModule,
    MatBottomSheetModule
  ],
  exports: [DoorbellBottomSheetComponent],
  entryComponents: [DoorbellBottomSheetComponent]
})
export class DoorbellBottomSheetModule { }
