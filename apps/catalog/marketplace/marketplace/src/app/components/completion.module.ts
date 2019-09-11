import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { CatalogCompletionComponent } from "./completion.component";
import { FeedbackMessageModule } from "@blockframes/ui";
import { RouterModule } from "@angular/router";

@NgModule({
  declarations: [CatalogCompletionComponent],
  imports: [CommonModule, FeedbackMessageModule,
    RouterModule.forChild([{path: '', component: CatalogCompletionComponent}])]
})

export class CatalogCompletionModule {}
