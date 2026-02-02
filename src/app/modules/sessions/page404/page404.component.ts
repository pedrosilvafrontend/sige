import { Component } from '@angular/core';
import { ErrorCodeComponent } from '@modules/common/error-code/error-code.component';

@Component({
    selector: 'app-page404',
    templateUrl: './page404.component.html',
    styleUrls: ['./page404.component.scss'],
    standalone: true,
    imports: [ErrorCodeComponent]
})
export class Page404Component {

}
