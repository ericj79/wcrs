import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, BehaviorSubject, Observable, timer, interval } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { FireDbService } from './fire-db.service';
import { GoalData } from './models/entries';
import { trigger, style, animate, transition } from '@angular/animations';

declare global {
  interface Window {
    confetti: any;
  }
}
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  animations: [
    trigger('inOutAnimation', [
      transition(':enter', [
        style({ height: 0, opacity: 0 }),
        animate('1s ease-in-out', style({ height: 100, opacity: 1 })),
      ]),
    ]),
  ],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'West Chester Relief Society';
  private destructorSubject = new Subject<boolean>();
  public noObjects = true;
  private metGoalSubject = new BehaviorSubject<boolean>(false);
  private goalSubject = new BehaviorSubject<number>(100);
  private countSubject = new BehaviorSubject<number>(0);

  private confettiCanvas: any | null = null;
  public goal$: Observable<number>;
  public count$: Observable<number>;
  public metGoal$: Observable<boolean>;

  constructor(private db: FireDbService) {
    this.goal$ = this.goalSubject.asObservable();
    this.count$ = this.countSubject.asObservable();
    this.metGoal$ = this.metGoalSubject.asObservable();
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
        if (goal <= completed) {
          if (this.metGoalSubject.getValue() !== true) {
            this.startConfetti();
          }
          this.metGoalSubject.next(true);
        } else {
          this.metGoalSubject.next(false);
        }
      });
  }

  randomInRange(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }

  startConfetti() {
    const defaults = {
      startVelocity: 30,
      spread: 360,
      ticks: 60,
      zIndex: 0,
    };

    const duration = 5 * 1000;
    const endTimer = timer(duration);
    const animationEnd = Date.now() + duration;
    interval(250)
      .pipe(takeUntil(endTimer))
      .subscribe(() => {
        const timeLeft = animationEnd - Date.now();

        var particleCount = 50 * (timeLeft / duration);
        // since particles fall down, start a bit higher than random
        window.confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: {
              x: this.randomInRange(0.1, 0.3),
              y: Math.random() - 0.2,
            },
          })
        );
        window.confetti(
          Object.assign({}, defaults, {
            particleCount,
            origin: {
              x: this.randomInRange(0.7, 0.9),
              y: Math.random() - 0.2,
            },
          })
        );
      });
  }

  onAdd() {
    this.db.addHour();
    this.noObjects = false;
  }

  onUndo() {
    this.db.removeHour();
    this.noObjects = this.db.myEntries.length === 0;
  }

  onClear() {
    this.db.clearEntries();
    this.noObjects = true;
  }
}
