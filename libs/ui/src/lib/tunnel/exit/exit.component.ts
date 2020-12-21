import { Component, OnInit, ChangeDetectionStrategy, Input, Inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { ShellConfig, FORMS_CONFIG } from '@blockframes/movie/form/shell/shell.component';
import { of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TunnelConfirmComponent } from '../layout/confirm/confirm.component';

@Component({
  selector: '[exitRedirect] tunnel-exit',
  templateUrl: './exit.component.html',
  styleUrls: ['./exit.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExitComponent implements OnInit {
  routeBeforeTunnel: string;

  @Input() exitRedirect: string;

  private sub: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    @Inject(FORMS_CONFIG) private configs: ShellConfig,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.routeBeforeTunnel = this.exitRedirect || '/c/o/';
  }

  redirect() {
    const isPristine = Object.values(this.configs).every(config => config.form.pristine);
    console.log(isPristine)
    if (isPristine) {
      return of(true);
    }
    const dialogRef = this.dialog.open(TunnelConfirmComponent, {
      width: '80%',
      data: {
        title: 'You are going to leave the Movie Form.',
        subtitle: 'Pay attention, if you leave now your changes will not be saved.'
      }
    });
    this.sub = dialogRef.afterClosed().pipe(
      switchMap(shouldSave => {
        /* Undefined means, user clicked on the backdrop, meaning just close the modal */
        if (typeof shouldSave === 'undefined') {
          return of(false)
        }
        return shouldSave ? this.save() : of(true)
      })
    ).subscribe(result => console.log(result));
    /* this.router.navigate([this.routeBeforeTunnel], { relativeTo: this.route }); */
  }

  private async save() {
    for (const name in this.configs) {
      await this.configs[name].onSave(false);
    }
  }
}
