import { FormControl } from '@angular/forms';
import { DistributionDealFloatingDurationForm } from '@blockframes/distribution-deals/form/terms/terms.form';
import { PaymentSchedule, ScheduledDateRaw } from '@blockframes/utils/common-interfaces';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createContractVersionPaymentScheduleControls(paymentSchedule: Partial<PaymentSchedule>) {
    return {
        percentage: new FormControl(paymentSchedule.percentage),
        date: new ContractVersionDateForm(paymentSchedule.date)
    }
}

type ContractVersionPaymentControl = ReturnType<typeof createContractVersionPaymentScheduleControls>;

export class ContractVersionPaymentScheduleForm extends FormEntity<ContractVersionPaymentControl> {
    constructor(paymentSchedule: Partial<PaymentSchedule> = {}) {
        super(createContractVersionPaymentScheduleControls(paymentSchedule))
    }
}

// Contract version date form

function createContractVersionDateControls(date: Partial<ScheduledDateRaw<Date>>) {
    return {
        floatingStart: new FormControl(date.floatingStart),
        floatingDuration: new DistributionDealFloatingDurationForm(date.floatingDuration),
        start: new FormControl(date.start)
    }
}

type ContractVersionDateControl = ReturnType<typeof createContractVersionDateControls>;

export class ContractVersionDateForm extends FormEntity<ContractVersionDateControl> {
    constructor(date: Partial<ScheduledDateRaw<Date>> = {}) {
        super(createContractVersionDateControls(date))
    }
}
