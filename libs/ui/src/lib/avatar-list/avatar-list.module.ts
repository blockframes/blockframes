import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarListComponent } from "./avatar-list.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatIconModule } from "@angular/material";

@NgModule({
  declarations: [AvatarListComponent],
  imports: [CommonModule, FlexLayoutModule, MatIconModule],
  exports: [AvatarListComponent],
})
export class AvatarListModule { }
