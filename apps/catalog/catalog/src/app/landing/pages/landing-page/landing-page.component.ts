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
      imgAsset: 'seller_perspective.webp',
      description: ''
    },
    {
      title: 'Buy quality content from a multitude of rights holders in one single package.',
      imgAsset: 'buyer_perspective.webp',
      description: 'Access one massive library, search for avails easily and buy content in larger volumes through one single deal offer and negotiation.'
    }
  ]

  public sellerFeatures = [
    {
      title: 'Import your content easily',
      imgAsset: 'bulk_import.webp',
      description: 'Upload your films’ data, promotional elements and rights availabilities directly on the platform or by uploading an Excel template.'
    },
    {
      title: 'Manage your offers and deals',
      imgAsset: 'deal_management.webp',
      description: 'Manage your current offers and sales deals, track negotiations and follow each deal’s status directly on the platform.'
    },
    {
      title: 'Track your films’ activity',
      imgAsset: 'sales_statistics.webp',
      description: 'Get detailed stats on your films’ activity on the marketplace, and get notified for any new activity.'
    },
    {
      title: 'A Human Salesforce',
      imgAsset: 'human_salesforce.webp',
      description: 'Make the most of your library thanks to the Archipel Content salesforce, who will editorialize the platform and push the right content to the right Buyers.'
    }
  ];

  public buyerFeatures = [
    {
      title: 'Access to line-up and library content ',
      imgAsset: 'library_content.webp',
      description: 'Search for quality content from a multitude of different Rights Holders in one consolidated library.'
    },
    {
      title: 'Efficient content browsing',
      imgAsset: 'efficient_content_browsing.webp',
      description: 'Search content in a simple and efficient way and find what you’re looking for in just a few clicks, using efficient search criteria and filters'
    },
    {
      title: 'Package deals',
      imgAsset: 'package_deal.webp',
      description: 'Group several Sellers’ titles together in one deal.'
    },
    {
      title: 'Deals management',
      imgAsset: 'deal_management.webp',
      description: 'Keep track of your deals information and negotiations. Download related documents.Get notified of any new element or information.'
    }
  ]

  constructor(
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle()
  }
}
