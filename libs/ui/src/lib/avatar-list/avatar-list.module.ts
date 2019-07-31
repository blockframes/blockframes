import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarListComponent } from "./avatar-list.component";
import { FlexLayoutModule } from "@angular/flex-layout";

@NgModule({
  declarations: [AvatarListComponent],
  imports: [CommonModule, FlexLayoutModule],
  exports: [AvatarListComponent],
  entryComponents: []
})
export class AvatarListModule { }
