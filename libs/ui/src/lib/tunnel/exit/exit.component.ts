import { Component, OnInit, ChangeDetectionStrategy, Input, Inject } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ShellConfig, FORMS_CONFIG } from '@blockframes/movie/form/shell/shell.component';

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
    private route: ActivatedRoute,
    @Inject(FORMS_CONFIG) private configs: ShellConfig
  ) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.exitRedirect || '/c/o/';
  }

  async redirect() {
    console.log(this.configs)
    this.router.navigate([this.routeBeforeTunnel], { relativeTo: this.route });
  }
}
