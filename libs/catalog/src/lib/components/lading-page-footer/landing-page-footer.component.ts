import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'catalog-landing-page-footer',
  templateUrl: './landing-page-footer.component.html',
  styleUrls: ['./landing-page-footer.component.scss']
})
export class LandingPageFooterComponent implements OnInit {
  public emailControl: FormControl = new FormControl('', Validators.email);

  constructor(private breakpoint: BreakpointObserver, private snackbar: MatSnackBar) { }

  ngOnInit() { }

  public registerEmailForNewsletter() {
    if (this.emailControl.valid) {
      // TODO #1366 
      this.snackbar.open('Thanks for subscribing to the newsletter', 'close',
        { duration: 3000 })
    }
  }

  public get layout() {
    if (this.breakpoint.isMatched('(max-width: 599px)')) {
      return 'column'
    } else {
      return 'row'
    }
  }

  public get alignLayout() {
    if (this.breakpoint.isMatched('(max-width: 599px)')) {
      return 'start center'
    } else {
      return 'space-around start';
    }
  }

  public get flexGap() {
    if (this.breakpoint.isMatched('(max-width: 599px)')) {
      return '0px';
    } else {
      return '100px';
    }
  }

  public get socialMediaIconsAlign() {
    if (this.breakpoint.isMatched('(max-width: 599px)')) {
      return 'space-around start'
    } else {
      return 'space-between start';
    }
  }
}
