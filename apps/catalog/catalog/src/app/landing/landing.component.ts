import { Component, ChangeDetectionStrategy } from '@angular/core';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatalogLandingComponent {
  public tabNames = ['Seller', 'Buyer'];

  public tabTitle = [
    {
      title: 'Valorize your back catalog.',
      imgAsset: 'lp_catalog_seller_perspective.png',
      description: 'Get extra visibility on your back catalog and maximize revenues on library sales.'
    },
    {
      title: 'Buy quality content from a multitude of rights holders in one single package.',
      imgAsset: 'lp_catalog_buyer_perspective.png',
      description: 'Access one massive library, search for avails easily and buy content in larger volumes through one single deal offer and negotiation.'
    }
  ]

  public sellerFeatures = [
    {
      title: 'Import your content easily',
      imgAsset: 'add_files.svg',
      description: 'Upload your films’ data, promotional elements and rights availabilities directly on the platform or by uploading an Excel template.'
    },
    {
      title: 'Manage your offers and deals',
      imgAsset: 'deal_management.svg',
      description: 'Manage your current offers and sales deals, track negotiations and follow each deal’s status directly on the platform.'
    },
    {
      title: 'Track your films’ activity',
      imgAsset: 'sales_statistics.svg',
      description: 'Get detailed stats on your films’ activity on the marketplace, and get notified for any new activity.'
    },
    {
      title: 'Benefit from a dedicated sales person',
      imgAsset: 'human_salesforce.svg',
      description: 'Make the most of your library thanks to the Archipel Content salesforce, who will editorialize the platform and push the right content to the right Buyers.'
    }
  ];

  public buyerFeatures = [
    {
      title: 'Access to line-up and library content ',
      imgAsset: 'library_content.svg',
      description: 'Search for quality content from a multitude of different Rights Holders in one consolidated library.'
    },
    {
      title: 'Efficient content browsing',
      imgAsset: 'efficient_content_browsing.svg',
      description: 'Search content in a simple and efficient way and find what you’re looking for in just a few clicks, using efficient search criteria and filters'
    },
    {
      title: 'Package deals',
      imgAsset: 'package_deal.svg',
      description: 'Group several Sellers’ titles together in one deal.'
    },
    {
      title: 'Deals management',
      imgAsset: 'deal_management.svg',
      description: 'Keep track of your deals information and negotiations. Download related documents.Get notified of any new element or information.'
    }
  ]

  constructor(
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle()
  }
}
