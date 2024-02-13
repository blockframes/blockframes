// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Blockframes


@Component({
  selector: 'waterfall-amortization-view',
  templateUrl: './amortization-view.component.html',
  styleUrls: ['./amortization-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmortizationViewComponent {
  path = '/assets/images/demo-cannes/amortization-view/Film Amortization_1.svg';
  movieId = this.route.snapshot.params.movieId;
  constructor(private router: Router,private route: ActivatedRoute,) {

  }

  switch() {

    if (this.path === '/assets/images/demo-cannes/amortization-view/Film Amortization_1.svg') {
      this.path = '/assets/images/demo-cannes/amortization-view/Film Amortization_2.svg';
    } else if (this.path === '/assets/images/demo-cannes/amortization-view/Film Amortization_2.svg') {
      this.path = '/assets/images/demo-cannes/amortization-view/Film Amortization_3.svg';
    } else if (this.path === '/assets/images/demo-cannes/amortization-view/Film Amortization_3.svg') {
      this.path = '/assets/images/demo-cannes/amortization-view/Film Amortization_4.svg';
    } else if (this.path === '/assets/images/demo-cannes/amortization-view/Film Amortization_4.svg') {
      this.path = '/assets/images/demo-cannes/amortization-view/Film Amortization_5.svg';
    } else if (this.path === '/assets/images/demo-cannes/amortization-view/Film Amortization_5.svg') {
      this.path = '/assets/images/demo-cannes/amortization-view/Film Amortization_6.svg';
    } else if (this.path === '/assets/images/demo-cannes/amortization-view/Film Amortization_6.svg') {
      this.path = '/assets/images/demo-cannes/amortization-view/Film Amortization_1.svg';
    } 

  }
}
