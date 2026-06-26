import { Component, ChangeDetectionStrategy } from '@angular/core';
import { ErrorCodeComponent } from '@modules/common/error-code/error-code.component';

@Component({
    selector: 'app-page403',
    templateUrl: './page403.component.html',
    styleUrls: ['./page403.component.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [ErrorCodeComponent]
})
export class Page403Component {

}
