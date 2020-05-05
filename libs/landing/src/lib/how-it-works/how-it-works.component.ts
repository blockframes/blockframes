import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

interface Display {
  title: string,
  description: string,
  image?: string
}

@Component({
  selector: '[tabNames] [tabTitle] [sellerFeatures] [buyerFeatures] landing-how-it-works',
  templateUrl: './how-it-works.component.html',
  styleUrls: ['./how-it-works.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingHowItWorksComponent {
  @Input() tabNames: string[];

  @Input() tabTitle: Display[];

  @Input() sellerFeatures: Display[];

  @Input() buyerFeatures: Display[];
}
