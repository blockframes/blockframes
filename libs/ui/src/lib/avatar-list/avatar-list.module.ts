import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AvatarListComponent } from "./avatar-list.component";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MatIconModule } from "@angular/material";
import { CropperModule } from "../cropper/cropper.module";

@NgModule({
  declarations: [AvatarListComponent],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MatIconModule,
    CropperModule,
  ],
  exports: [AvatarListComponent],
})
export class AvatarListModule { }
