import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { DoorbellBottomSheetComponent } from './doorbell.component';
import { DisplayUserModule } from '@blockframes/utils/pipes/display-user.pipe';

// Material
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
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
  exports: [DoorbellBottomSheetComponent]
})
export class DoorbellBottomSheetModule { }
