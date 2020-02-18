import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'catalog-key-features',
  templateUrl: './key-features.component.html',
  styleUrls: ['./key-features.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogKeyFeaturesComponent {
  public keyFeatures = [
    {
      title: 'Package deals',
      description: `Archipel Content gives Content Buyers access to a consolidated library where they can buy
      quality content from a multitude of Sellers (Sales Agents, Distributors, Producers…) in one
      simple package.
      One massive library, one package offer, one deal.`,
      imgPath: '/assets/images/key-feature1.png'
    },
    {
      title: 'Blockchain',
      description: `Blockchain is an open, distributed ledger that can record transactions between different
      parties efficiently in a verifiable and permanent way.
      On Archipel Content, we use it for securing authentication processes, timestamping
      transactions, and implementing an automated and instantaneous revenue redistribution.`,
      imgPath: '/assets/images/key-feature2.png'
    },
    {
      title: 'Our expertise',
      description: `We also have advanced expertise in the Media industry, as Archipel Content comes directly from
      the expertise of the film production and financing outfit Logical Pictures and the
      international sales outfit Pulsar Content, with whom we work hand in hand. This expertise and
      network help us create tech solutions that suit the industry’s needs and standards.`,
      imgPath: '/assets/images/key-feature3.png'
    }
  ];
}
