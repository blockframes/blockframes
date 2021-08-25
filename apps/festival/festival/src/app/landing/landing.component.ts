import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'festival-landing',
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LandingComponent {

  public partnerLogoList = [
    'partner_alibaba.png',
    'partner_amazon.png',
    'partner_apple_tv.png',
    'partner_netflix.png',
    'partner_disney.png',
    'partner_hbo_max.png',
    'partner_hulu.png',
    'partner_bbc_film.png',
    'partner_lionsgate.png',
    'partner_mubi.png',
    'partner_paramount.png',
    'partner_mgm.png',
    'partner_sony.png',
    'partner_A24.png'
  ];

  public tabNames = ['For Sales Agents', 'For Buyers'];

  public tabTitle = [
    {
      title: 'For Sales Agents',
      imgAsset: 'landing_sellers.svg',
      description: "Archipel Market replicates the traditional film market experience online, all year round. With one single tool, showcase your line-up, organize screenings, presentations and meetings on a platform already used by hundreds of buyers... anytime, anywhere!"
    },
    {
      title: 'For Buyers',
      imgAsset: 'landing_buyers.svg',
      description: 'Archipel Market enables buyers to replicate the market experience online and access projects & events from multiple sales companies, all year round on one single tool.'
    }
  ]

  public sellerFeatures = [
    {
      title: 'VIRTUAL BOOTHS',
      imgAsset: 'virtual_booths.svg',
      description: 'Promote your line-up on your year-round virtual booth.'
    },
    {
      title: 'SCREENINGS',
      imgAsset: 'live_screenings.svg',
      description: 'Engage buyers by organizing secure live screenings & presentations, anytime of the year.'
    },
    {
      title: 'MEETINGS',
      imgAsset: 'live_meetings.svg',
      description: 'Share your documents in high quality during your meetings with buyers.'
    }
  ];

  public sellerBenefits = [
    {
      title: 'Gain time and energy',
      imgAsset: 'benefits_time.svg',
      description: 'Use one single tool to promote your line-up all year round, during and outside festivals and markets.'
    },
    {
      title: "Simplify your buyers lives",
      imgAsset: 'benefits_simplify.svg',
      description: 'With one single login, buyers can discover projects and attend events from multiples companies, all year round.'
    },
    {
      title: 'Expand your reach',
      imgAsset: 'benefits_network.svg',
      description: 'Generate interest from hundreds of buyers already using Archipel regularly.'
    },
    {
      title: 'Don’t change your habits',
      imgAsset: 'benefits_habits.svg',
      description: "Promote, screen, meet. Keep your buyers interested... just like you're used to during markets."
    }
  ];

  public buyerFeatures = [
    {
      title: 'CENTRALIZED LISTINGS',
      imgAsset: 'virtual_booths.svg',
      description: 'Search and discover projects and events from multiple sales companies on one single tool, all year round.'
    },
    {
      title: 'LIVE SCREENINGS',
      imgAsset: 'live_screenings.svg',
      description: 'Attend live screenings and presentations from your favorite sales agents.'
    },
    {
      title: 'MEETINGS',
      imgAsset: 'live_meetings.svg',
      description: 'Get high quality videos and documents during your meetings with sales agents.'
    }
  ]

  public buyerBenefits = [
    {
      title: 'Gain time and energy',
      imgAsset: 'benefits_time.svg',
      description: 'Stop jumping from one platform to the other. With one single password, access projects and events from multiple companies all year round.'
    },
    {
      title: "Discover new content",
      imgAsset: 'benefits_discover.svg',
      description: 'Get updated and discover projects or events that were not on your radar.'
    },
    {
      title: 'Don’t change your habits',
      imgAsset: 'benefits_habits.svg',
      description: "Watch films, meet, discover and track projects... just like you're used to during markets!"
    },
    {
      title: 'Have a smooth experience',
      imgAsset: 'benefits_experience.svg',
      description: "Our online client support is available 24/7 to answer all of your questions and guide you through the platform if needed!"
    }
  ]

  public clientOpinion = [
    {
      name: "Nate bolotin",
      jobTitle: "Partner",
      text: "« We use Archipel to recreate the momentum of live market screenings outside markets. It helps generate emulation around our projects and has often led to some interesting bidding wars. »",
      logo: "XYZ_logo.png",
      company: "XYZ Films",
    },
    {
      name: "Inès Papo",
      jobTitle: "Sales Assistant",
      text: "« I love working with Archipel. The platform is smooth, the team is available, and most importantly, they understand how this industry works. »",
      logo: "orangeStudio.png",
      company: "Orange Studio",
    },
  ]

}
