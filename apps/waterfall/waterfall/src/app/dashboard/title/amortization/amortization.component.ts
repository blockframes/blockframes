// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

// Blockframes

@Component({
  selector: 'waterfall-amortization',
  templateUrl: './amortization.component.html',
  styleUrls: ['./amortization.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmortizationComponent  {

  path = '/assets/images/demo-cannes/Amortization.svg';
  movieId = this.route.snapshot.paramMap.get('movieId');

  constructor(
    private route: ActivatedRoute,
    private router: Router) {

  }


  goTo() {
    this.router.navigate(['/c/o/dashboard/waterfall/', this.movieId, 'amortization-view'], { relativeTo: this.route });
  }
}
