// Angular
import { Component, ChangeDetectionStrategy } from '@angular/core';

// Blockframes


@Component({
  selector: 'waterfall-title-statements',
  templateUrl: './statements.component.html',
  styleUrls: ['./statements.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatementsComponent {

  topPath = '/assets/images/demo-cannes/Nav_Distrib.svg';
  path = '/assets/images/demo-cannes/Statements_Distrib.svg';

  switchTop() {
    if(this.topPath === '/assets/images/demo-cannes/Nav_Distrib.svg' ) {
      this.topPath = '/assets/images/demo-cannes/Nav_Coprod.svg';
      this.path = '/assets/images/demo-cannes/Statements_Coprod.svg'
    } else {
      this.topPath = '/assets/images/demo-cannes/Nav_Distrib.svg';
      this.path = '/assets/images/demo-cannes/Statements_Distrib.svg'
    }
  }

  switch() {
    if(this.topPath === '/assets/images/demo-cannes/Nav_Distrib.svg' ) {
      if (this.path === '/assets/images/demo-cannes/Statements_Distrib.svg') {
        this.path = '/assets/images/demo-cannes/distrib-statements/Statement_1.svg';
      } else if(this.path === '/assets/images/demo-cannes/distrib-statements/Statement_1.svg' ) {
        this.path = '/assets/images/demo-cannes/distrib-statements/Statement_2.svg';
      } else if(this.path === '/assets/images/demo-cannes/distrib-statements/Statement_2.svg' ) {
        this.path = '/assets/images/demo-cannes/distrib-statements/Statement_3.svg';
      } else if(this.path === '/assets/images/demo-cannes/distrib-statements/Statement_3.svg' ) {
        this.path = '/assets/images/demo-cannes/distrib-statements/Statement_4.svg';
      } else if(this.path === '/assets/images/demo-cannes/distrib-statements/Statement_4.svg' ) {
        this.path = '/assets/images/demo-cannes/distrib-statements/Statement_5.svg';
      } else if(this.path === '/assets/images/demo-cannes/distrib-statements/Statement_5.svg' ) {
        this.path = '/assets/images/demo-cannes/distrib-statements/Statement_6.svg';
      } else if(this.path === '/assets/images/demo-cannes/distrib-statements/Statement_6.svg' ) {
        this.path = '/assets/images/demo-cannes/distrib-statements/Statement_7.svg';
      } else if(this.path === '/assets/images/demo-cannes/distrib-statements/Statement_7.svg' ) {
        this.path = '/assets/images/demo-cannes/distrib-statements/Statement_8.svg';
      } else if(this.path === '/assets/images/demo-cannes/distrib-statements/Statement_8.svg' ) {
        this.path = '/assets/images/demo-cannes/distrib-statements/Statement_9.svg';
      } else if(this.path === '/assets/images/demo-cannes/distrib-statements/Statement_9.svg' ) {
        this.path = '/assets/images/demo-cannes/distrib-statements/Statement_10.svg';
      } else {
        this.path = '/assets/images/demo-cannes/Statements_Distrib.svg';
      }
    } else {
      if (this.path === '/assets/images/demo-cannes/Statements_Coprod.svg') {
        this.path = '/assets/images/demo-cannes/outgoing-statements/Outgoing_1.svg';
      } else if(this.path === '/assets/images/demo-cannes/outgoing-statements/Outgoing_1.svg' ) {
        this.path = '/assets/images/demo-cannes/outgoing-statements/Outgoing_2.svg';
      } else {
        this.path = '/assets/images/demo-cannes/Statements_Coprod.svg';
      }
    }



  }
}
