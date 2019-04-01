import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StakeholderListComponent } from './list/list.component';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
  ],
  declarations: [StakeholderListComponent]
})
export class StakeholderModule {}
