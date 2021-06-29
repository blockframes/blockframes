import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RequestDemoRole } from '@blockframes/utils/request-demo';

@Component({
  selector: 'financiers-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {

  public userRoles: RequestDemoRole[] = ['investor', 'financier'];

  public pdfLink = 'assets/docs/film-industry.pdf';

  public tabNames = ['Investors', 'Professional Content Financiers'];

  public tabTitle = [
    {
      title: 'For Investors',
      imgAsset: 'lp_financiers_seller_perspective.png',
      description: 'A reliable way to invest in top film & TV projects, backed by professional financiers. By sharing their investment, investors benefit from their expertise in dealmaking and content acquisition.'
    },
    {
      title: 'For Professionals',
      imgAsset: 'lp_financiers_buyer_perspective.png',
      description: 'Package the financing of your projects by connecting with high-capacity investors looking to invest in films and series.'
    }
  ]

  public sellerFeatures = [
    {
      title: 'Tag along with professional content financiers',
      imgAsset: 'tag_along.svg',
      description: 'Co-invest with professional funds and benefit from « pari passu » financial conditions, already optimized thanks to their expertise.'
    },
    {
      title: 'Get access to prominent film companies and projects',
      imgAsset: 'topfilms.svg',
      description: 'Find the hottest projects selected by a pool of industry veterans and benefit from their knowledge of the industry.'
    },
    {
      title: 'Learn about investing in the content industry',
      imgAsset: 'knowledge.svg',
      description: 'No experience needed. \n Discover why content is a profitable investment. \n',
      link: {
        href: this.pdfLink,
        text: 'Download our investment guide.'
      }
    },
    {
      title: 'Enjoy exclusive privileges',
      imgAsset: 'exclusive_priviledges.svg',
      description: 'Get perks and live the full experience of the content industry.'
    }
  ];

  public financierFeatures = [
    {
      title: 'Access a new qualified investors network',
      imgAsset: 'gems.svg',
      description: 'Benefit from a selected pool of high- capacity investors coming from all around the world.'
    },
    {
      title: 'Increase your investment capacity',
      imgAsset: 'matching.svg',
      description: 'Share or refinance your investment ticket to complete your financing, access bigger projects and hedge your risk.'
    },
    {
      title: 'Take a fee on the money you raise',
      imgAsset: 'filmpage.svg',
      description: 'Be rewarded for the financing you gather.'
    }
  ]
}
