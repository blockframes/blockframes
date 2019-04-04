import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FlexLayoutModule } from '@angular/flex-layout';
import { StakeholderListComponent } from './list/list.component';
import { MatCardModule } from '@angular/material/card';

@NgModule({
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatCardModule
  ],
  declarations: [StakeholderListComponent]
})
export class StakeholderModule {}
