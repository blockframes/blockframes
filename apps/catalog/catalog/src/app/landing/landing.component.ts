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
      title: 'For sellers',
      imgAsset: 'lp_catalog_seller_perspective.png',
      description: 'Monetize your full catalog at its maximum potential.',
    },
    {
      title: 'For Buyers ',
      imgAsset: 'library_content.svg',
      description: 'Search for avails easily through one curated library and buy content in larger volumes through one single deal.',
    }
  ]

  public sellerFeatures = [
    {
      title: 'Reach a community of over 1500 buyers, free of charge. one more line here',
      imgAsset: 'content_sellers_list.svg',
      description: 'text missing here lorem lorem lorem lorem lorem'
    },
    {
      title: 'Benefit from the experience of a dedicated sales & marketing team one more line here',
      imgAsset: 'content_pitching_movie.png',
      description: 'text missing here lorem lorem lorem lorem lorem'
    },
    {
      title: 'Get extra opportunities thanks to simplified contracting. one more line here',
      imgAsset: 'content_manage_offers.svg',
      description: 'text missing here lorem lorem lorem lorem lorem'
    },
    {
      title: 'Monitor your activity thanks to simplified imports, tracking and deal monitoring systems.',
      imgAsset: 'content_title_stats.svg',
      description: 'text missing here lorem lorem lorem lorem lorem'
    }
  ];

  public buyerFeatures = [
    {
      title: 'License from multiple rights owners with only one contract',
      imgAsset: 'content_multi_sellers.svg',
      description: 'text missing here lorem lorem lorem lorem lorem',
      mediaOrientation: 'right'
    },
    {
      title: 'Search for avails easily on a user-friendly interface. one more line here',
      imgAsset: 'content_movie_genres.svg',
      description: 'text missing here lorem lorem lorem lorem lorem',
      mediaOrientation: 'left'
    },
    {
      title: 'Access all formats and genres (feature films, drama series, documentaries, kids content…)',
      imgAsset: 'content_search_movies.svg',
      description: 'text missing here lorem lorem lorem lorem lorem',
      mediaOrientation: 'right'
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
}
