import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ErrorCodeComponent } from '@modules/common/error-code/error-code.component';

@Component({
    selector: 'app-page500',
    templateUrl: './page500.component.html',
    styleUrls: ['./page500.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ErrorCodeComponent]
})
export class Page500Component {

}
