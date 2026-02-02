import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnInit,
  ViewEncapsulation
} from '@angular/core';
import { AuthService, LessonStateService, MenuService } from '@services';
import { CdkMenuModule } from '@angular/cdk/menu';
import { Router, RouterLink } from '@angular/router';
import { MatIcon, MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { LessonBatch, Menu, UserType } from '@models';
import { take } from 'rxjs';
import { MainService } from '@core/main.service';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconButton } from '@angular/material/button';
import { MatBadge } from '@angular/material/badge';
import { ActivityService } from '@modules/config/activity/activity.service';

@Component({
  selector: 'ui-menu',
  imports: [
    CdkMenuModule,
    MatMenuModule,
    MatIconModule,
    MatIconButton,
    TranslatePipe,
    RouterLink,
    MatBadge,
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuComponent implements OnInit {
  private router = inject(Router);
  private menuService = inject(MenuService);
  private activityService = inject(ActivityService);
  private lessonStateService = inject(LessonStateService);
  private main = inject(MainService);
  private auth = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  public menu$ = this.menuService.getAll();
  public menu: Menu[] = [];
  public notifications: {item: any, message: string}[] = [];

  public allowMenu = {
    managers: false,
    configs: false,
    teachers: false,
  };

  goToLesson(lesson: LessonBatch) {
    this.lessonStateService.setSelectedLesson(lesson);
    this.router.navigate([`/lessons/${lesson.id}`], { replaceUrl: true }).then();
  }

  ngOnInit(): void {

    this.menu$.pipe(take(1)).subscribe(menu => {
      this.menu = menu;
      this.cdr.detectChanges();
    });

    this.allowMenu.managers = this._allowMenu('managers');
    this.allowMenu.configs = this._allowMenu('configs');
    this.allowMenu.teachers = this._allowMenu('teachers');

    this.activityService.getCountActivities().pipe(take(1)).subscribe((data: any) => {
      // console.log('Total activities:', count);
      (data || []).forEach((item: any) => {
        if (!item.tests) {
          const message = `Não há prova de ${item.curricularComponent.name} para a turma ${item.class.code} no mes atual`;
          this.notifications.push({ item, message });
        }
        if (!item.works) {
          const message = `Não há trabalho de ${item.curricularComponent.name} para a turma ${item.class.code} no mes atual`;
          this.notifications.push({ item, message });
        }
      })
      this.cdr.detectChanges();
    });
  }

  _allowMenu(route: string) {
    const user = this.auth.user$.value;
    if (!user || !user.role) {
      return false;
    }
    if (user.role === 'admin') {
      return true;
    }
    if (route === 'managers') {
      return ['association', 'principal', 'coordinator'].includes(user.role);
    }
    if (route === 'configs') {
      return ['association', 'principal', 'coordinator'].includes(user.role);
    }
    if (route === 'teachers') {
      return ['association', 'principal', 'coordinator'].includes(user.role);
    }
    return true;
  }

  logout() {
    this.auth.logout();
  }

  log(value: any): void {
    console.log('LOG:::', value);
  }
}
