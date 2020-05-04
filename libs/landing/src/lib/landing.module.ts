import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LandingFooterComponent } from './footer/footer.component';
import { LandingHeaderComponent } from './header/header.component';
import { LandingHowItWorksComponent } from './how-it-works/how-it-works.component';
import { LandingLearnMoreComponent } from './learn-more/learn-more.component';
import { LandingToolbarComponent } from './toolbar/toolbar.component';

@NgModule({
  declarations: [
    LandingFooterComponent,
    LandingHeaderComponent,
    LandingHowItWorksComponent,
    LandingLearnMoreComponent,
    LandingToolbarComponent
  ],
  imports: [CommonModule],
  exports: [
    LandingFooterComponent,
    LandingHeaderComponent,
    LandingHowItWorksComponent,
    LandingLearnMoreComponent,
    LandingToolbarComponent
  ]
})
export class LandingModule {}
