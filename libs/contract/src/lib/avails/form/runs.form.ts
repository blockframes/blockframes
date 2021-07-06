import { FormControl, FormGroup } from "@angular/forms";
import { Term } from "@blockframes/contract/term/+state";
import { FormEntity } from "@blockframes/utils/form";

function getControls(runs: Partial<Term['runs']>) {
    return {
        broadcasts: new FormControl(runs.broadcasts),
        catchup: new FormGroup({
            from: new FormControl(runs.catchup?.from),
            duration: new FormControl(runs.catchup?.duration),
            period: new FormControl(runs.catchup?.period),
        })
    }
}

type RunsControls = ReturnType<typeof getControls>;

export class RunsForm extends FormEntity<RunsControls, Term['runs']> {
    constructor(runs: Partial<Term['runs']> = {}) {
        super(getControls(runs));
    }
}