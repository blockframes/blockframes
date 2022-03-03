import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
import { applicationUrl } from '@blockframes/utils/apps';
import { DynamicTitleService } from '@blockframes/utils/dynamic-title/dynamic-title.service';

@Component({
  selector: 'catalog-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class CatalogLandingComponent {
  public tabNames = ['Seller', 'Buyer'];
  @ViewChild('sellerVideo') sellerVideo;
  @ViewChild('buyerVideo') buyerVideo;

  public applicationUrl = applicationUrl;
  public tabTitle = [
    {
      title: 'For sellers',
      imgAsset: 'video_placeholder_seller.png',
      description: 'Monetize your full catalog at its maximum potential effortlessly, thanks to an innovative way of making deals.',
    },
    {
      title: 'For Buyers ',
      imgAsset: 'video_placeholder_buyer.png',
      description: 'Search for avails easily through one curated library and buy content in larger volumes through one single deal.',
    }
  ];

  public sellerFeatures = [
    {
      title: 'Magic import',
      description: "Import your content without lifting a finger. Let our team do it for you. ",
      imgAsset: 'content_sellers_feature1.svg'
    },
    {
      title: 'Find the right Buyers',
      description: 'Benefit from the experience of a dedicated sales & marketing team, who tailor-makes offers to buyers.',
      imgAsset: 'content_sellers_feature2.svg'
    },
    {
      title: 'Make more deals',
      description: 'Boost your content sales & manage your deals easily thanks to a user-friendly interface.',
      imgAsset: 'content_sellers_feature3.svg'
    }
  ];

  public sellerBenefits = [
    {
      title: 'More deals, less efforts',
      description: `Get assistance from content import \nto deal finalization. Never lose the \nhuman touch.`,
      imgAsset: 'content_seller_benefit1.svg'
    },
    {
      title: 'Over 1500 international buyers',
      description: 'Expand your catalog\'s potential by reaching \nout to a large community of buyers, even in \nhard-to-reach territories.',
      imgAsset: 'content_seller_benefit2.svg'
    }
  ];

  public buyerFeatures = [
    {
      title: 'Simplified avails search',
      description: 'Select your search criteria (territory, media, time window) and get the list of matching contents in just as few clicks. Export and share your customized list of titles.',
      imgAsset: 'content_buyer_feature1.svg'
    },
    {
      title: 'Easy-to-read results',
      description: 'Look for specific avails on a title-by-title basis through innovative map and/or calendar views.',
      imgAsset: 'content_buyer_feature2.svg'
    },
    {
      title: 'Simplified deal-making',
      description: 'Make your offer in just a few clicks. Benefit from the help & coordination of our professional sales team.',
      imgAsset: 'content_buyer_feature3.svg'
    }
  ];

  public buyerBenefits = [
    {
      title: 'Save time, get results',
      description: 'Always receive a timely reply to your \nenquiries and offers. Guaranteed by \nour professional team.',
      imgAsset: 'content_buyer_benefit1.svg'
    },
    {
      title: 'Curated content just for you',
      description: 'Find the content you’re looking for, and only \nreceive carefully curated content, hand-\npicked according to your needs.',
      imgAsset: 'content_buyer_benefit2.png'
    }
  ];

  constructor(
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle();
  }

  onTabChanged(e) {
    if(e.index === 0) {
      this.sellerVideo.nativeElement.play();
    } else {
      this.buyerVideo.nativeElement.play();
    }
  }
}
