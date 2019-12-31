import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

@Component({
  selector: 'start-tunnel',
  templateUrl: './start-tunnel.component.html',
  styleUrls: ['./start-tunnel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class StartTunnelComponent implements OnInit {
  breakpoint;
  public cardContents = [
    {
      title: 'Title Information',
      description: 'Your title will be published on the platform only once you have signed a contract with us.'
    },
    {
      title: 'Licensed Rights',
      description: 'Your title will be published on the platform only once you have signed a contract with us.'
    },
    {
      title: 'Upload Media',
      description: 'Your title will be published on the platform only once you have signed a contract with us.'
    },
    {
      title: 'Legal Information',
      description: 'Your title will be published on the platform only once you have signed a contract with us.'
    },
  ]

  constructor() {}

  ngOnInit() {
    this.breakpoint = (window.innerWidth <= 760) ? 1 : 2;
}

  onResize(event) {
  this.breakpoint = (event.target.innerWidth <= 760) ? 1 : 2;
  }
}
