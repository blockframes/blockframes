import { Component, OnInit, ChangeDetectionStrategy, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: '[exitRedirect] tunnel-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExitComponent implements OnInit {
  routeBeforeTunnel: string;

  @Input() exitRedirect: string;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.exitRedirect || '/c/o/';
  }

  async redirect() {
    this.router.navigate([this.routeBeforeTunnel], { relativeTo: this.route });
  }
}
