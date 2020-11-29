import { Component, OnInit, OnDestroy } from '@angular/core';
import { FireDbService } from '../fire-db.service';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { GoalData } from '../models/entries';

@Component({
  selector: 'app-progress',
  templateUrl: './progress.component.html',
  styleUrls: ['./progress.component.css'],
})
export class ProgressComponent implements OnInit, OnDestroy {
  static readonly maxLen = 830;
  static readonly yStart = 925;

  private destructorSubject = new Subject<boolean>();
  private y2Subject = new BehaviorSubject<number>(ProgressComponent.yStart);
  private goalSubject = new BehaviorSubject<number>(0);
  private countSubject = new BehaviorSubject<number>(0);
  public y2$: Observable<number>;
  public goal$: Observable<number>;
  public count$: Observable<number>;
  public data$: Observable<GoalData | null> | undefined = undefined;

  constructor(private db: FireDbService) {
    this.y2$ = this.y2Subject.asObservable();
    this.goal$ = this.goalSubject.asObservable();
    this.count$ = this.countSubject.asObservable();
  }

  ngOnDestroy() {
    this.destructorSubject.next(true);
    this.destructorSubject.complete();
  }

  ngOnInit(): void {
    this.db
      .getAll()
      .pipe(takeUntil(this.destructorSubject))
      .subscribe((data: GoalData | null) => {
        if (data === null) return;
        const goal = data.goal;
        this.goalSubject.next(goal);
        let completed = 0;
        if (data.entries instanceof Object) {
          completed = Object.keys(data.entries).length;
        }
        this.countSubject.next(completed);
        if (goal > 0) {
          const percent = Math.min(completed / goal, 1);
          const height = percent * ProgressComponent.maxLen;
          this.y2Subject.next(ProgressComponent.yStart - height);
        }
      });
  }
}
