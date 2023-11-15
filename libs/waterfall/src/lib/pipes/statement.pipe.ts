import { Pipe, PipeTransform, NgModule } from '@angular/core';
import { RightholderPayment, Statement, isDistributorStatement, isProducerStatement } from '@blockframes/model';

@Pipe({ name: 'righholderPayment' })
export class RightHolderPaymentPipe implements PipeTransform {
  transform(statement: Statement): RightholderPayment {
    return isDistributorStatement(statement) || isProducerStatement(statement) ? statement.payments.rightholder : undefined;
  }
}

@NgModule({
  declarations: [RightHolderPaymentPipe],
  exports: [RightHolderPaymentPipe],
})
export class StatementPipeModule { }
