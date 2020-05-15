import { FormControl, Validators } from '@angular/forms';
import { DistributionRightFloatingDurationForm } from '@blockframes/distribution-rights/form/terms/terms.form';
import { PaymentSchedule, ScheduledDateRaw } from '@blockframes/utils/common-interfaces';
import { FormEntity } from '@blockframes/utils/form/forms/entity.form';

function createContractVersionPaymentScheduleControls(paymentSchedule: Partial<PaymentSchedule>) {
    return {
        percentage: new FormControl(paymentSchedule.percentage, Validators.min(0)),
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
        floatingDuration: new DistributionRightFloatingDurationForm(date.floatingDuration),
        start: new FormControl(date.start)
    }
}

type ContractVersionDateControl = ReturnType<typeof createContractVersionDateControls>;

export class ContractVersionDateForm extends FormEntity<ContractVersionDateControl> {
    constructor(date: Partial<ScheduledDateRaw<Date>> = {}) {
        super(createContractVersionDateControls(date))
    }
}
