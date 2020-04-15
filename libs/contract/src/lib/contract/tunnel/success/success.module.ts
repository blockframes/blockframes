import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { SuccessComponent } from "./success.component";
import { RouterModule } from "@angular/router";
import { ImgAssetModule } from "@blockframes/ui/theme";
import { MatButtonModule } from "@angular/material/button";

@NgModule({
    imports: [
        CommonModule,
        FlexLayoutModule,
        RouterModule.forChild([{ path: '', component: SuccessComponent }]),
        ImgAssetModule,
        MatButtonModule
    ],
    declarations: [SuccessComponent],
})
export class SuccessModule { }