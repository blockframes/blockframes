import { Component, ChangeDetectionStrategy, ViewEncapsulation, ViewChild } from '@angular/core';
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
  ]

  public sellerFeatures = [
    {
      title: 'Over 1500 international buyers',
      description: "Expand your catalog's potential by reaching out to a large community of buyers, free of charge.",
      imgAsset: 'content_sellers_list.svg'
    },
    {
      title: 'Tailor-made offers',
      description: 'Benefit from the experience of a dedicated sales & marketing team, who tailor-makes offers to buyers.',
      imgAsset: 'content_pitching_movie.svg'
    },
    {
      title: 'Simplified contracting',
      description: 'Negociate your deals and get extra opportunities thanks fast and simplified contracting.',
      imgAsset: 'content_manage_offers.svg'
    },
    {
      title: 'User-friendly interface',
      description: 'Monitor your avails and activity easily thanks to simplified imports and exports and deal monitoring systems.',
      imgAsset: 'content_title_stats.svg'
    }
  ];

  public buyerFeatures = [
    {
      title: 'Multi-Seller Deals',
      description: 'License from multiple rights owners through one single negotiation and contract.',
      imgAsset: 'content_multi_sellers.svg'
    },
    {
      title: 'Simplified avails search',
      description: 'Put away your endless avails sheets and browse content easily by filtering through avails, genres, languages, keywords... on a user-friendly interface.',
      imgAsset: 'content_movie_genres.svg'
    },
    {
      title: 'Curated content just for you',
      description: 'Only receive relevant and carefully curated content, hand-picked by our professional sales & marketing team.',
      imgAsset: 'content_search_movie.png'
    },
    {
      title: 'All format and genres',
      description: 'Access content from feature films, drama series, documentaries, kids content, and many more!',
      imgAsset: 'content_buyer_avails.svg'
    }
  ]

  public reviews = [
    {
      img: "european_sellers.png",
      title: "European sellers discuss AFM, hybrid realities and a brighter 2021",
      text: "« In the current market, it makes more sense to give buyers as many opportunities as possible to see our films rather than focusing on a handful of exclusive screenings in set timeframes… »",
      logo: "screendaily.png",
      link: "https://www.screendaily.com/features/european-sellers-discuss-afm-hybrid-realities-and-a-brighter-2021/5154926.article"
    },
    {
      img: "market_article.png",
      title: "Archipel Market To Provide Sales Agents, Buyers With Year-Round …",
      text: "« A tool that can maximize sales, while uniting sales agents and buyers throughout the year; a dedicated, streamlined, efficient tool to replicate and digitally enhance the experience of a sales pitch to a buyer… » ",
      logo: "variety.png",
      link: "https://variety.com/2020/film/global/cannes-archipel-market-logical-pictures-charades-1234631297"
    },
    {
      img: "screen_international.png",
      title: "Screen International FYC Awards Screening programme…",
      text: "Screen International has partnered with film market platform Archipel Market on an exclusive series of screenings focused on the international feature awards race… ",
      logo: "screendaily.png",
      link: "https://www.screendaily.com/news/screen-international-fyc-awards-screening-programme/5156125.article"
    }
  ]

  constructor(
    private dynTitle: DynamicTitleService
  ) {
    this.dynTitle.setPageTitle()
  }

  onTabChanged(e) {
    if(e.index === 0) {
      this.sellerVideo.nativeElement.play();
    } else {
      this.buyerVideo.nativeElement.play();
    }
  }
}
