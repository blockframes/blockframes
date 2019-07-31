import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

interface AppDetails {
  name: string;
  logoSrc: string;
  href: string;
}

@Component({
  selector: 'blockframes-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit {
  public dapps: AppDetails[] = [
    {
      name: 'Media Financiers',
      logoSrc: 'http://graphouille.g.r.pic.centerblog.net/6c2aaddd.png',
      href: '/movie-financing'
    },
    {
      name: 'Stories and More',
      logoSrc: 'http://recueil-de-png.r.e.pic.centerblog.net/8cc2960d.png',
      href: '/stories-and-more'
    },
    {
      name: 'Media Delivering',
      logoSrc: 'http://recueil-de-png.r.e.pic.centerblog.net/22f09c18.png',
      href: '/delivery'
    },
    {
      name: 'Bigger Boat',
      logoSrc: 'https://www.stickpng.com/assets/images/580b57fbd9996e24bc43bb8e.png',
      href: '/bigger-boat'
    }
  ];

  constructor() {}

  ngOnInit() {}
}
