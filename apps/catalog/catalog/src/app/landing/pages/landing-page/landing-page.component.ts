import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-landing-page',
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLandingPageComponent {
  public tabNames = ['Seller', 'Buyer'];

  public tabTitle = [
    {
      title: 'Maximize sales on library titles and access new buyers.',
      image: '/assets/images/seller_perspective.jpg',
      description: ''
    },
    {
      title: 'Buy quality content from a multitude of rights holders in one single package.',
      image: '/assets/images/buyer_perspective.jpg',
      description: 'Access one massive library, search for avails easily and buy content in larger volumes through one single deal offer and negotiation.'
    }
  ]

  public sellerFeatures = [
    {
      title: 'Bulk Import',
      image: 'bulk_import.webp',
      description: 'Import large amounts of data easily (either by directly filling a predefined template or with the help of an Archipel Content team member).'
    },
    {
      title: 'Deals Management',
      image: 'deal_management.webp',
      description: 'Keep track of your previous and ongoing deals information. Download related documents. Get notified of any new element or information. Check your avails. '
    },
    {
      title: 'Sales Statistics',
      image: 'sales_statistics.webp',
      description: 'Track your global sales and sales per title. Get an efficient overview of your data thanks to analytics tools.'
    },
    {
      title: 'A Human Salesforce',
      image: 'human_salesforce.webp',
      description: 'Make the most of your library thanks to the Archipel Content salesforce, who will editorialize the platform and push the right content to the right Buyers.'
    }
  ];

  public buyerFeatures = [
    {
      title: 'Access to line-up and library content ',
      image: 'library_content.webp',
      description: 'Search for quality content from a multitude of different Rights Holders in one consolidated library.'
    },
    {
      title: 'Efficient content browsing',
      image: 'efficient_content_browsing.webp',
      description: 'Search content in a simple and efficient way and find what you’re looking for in just a few clicks, using efficient search criteria and filters'
    },
    {
      title: 'Package deals',
      image: 'package_deal.webp',
      description: 'Group several Sellers’ titles together in one deal.'
    },
    {
      title: 'Deals management',
      image: 'deal_management.webp',
      description: 'Keep track of your deals information and negotiations. Download related documents.Get notified of any new element or information.'
    }
  ]

  constructor(
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle()
  }
}
