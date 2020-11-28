import { Component } from '@angular/core';
import { FireDbService } from './fire-db.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'West Chester Relief Society';
  noObjects = true;

  constructor(private db: FireDbService) {}

  onAdd() {
    this.db.addHour();
    this.noObjects = false;
  }

  onUndo() {
    this.db.removeHour();
    if (this.db.myEntries.length === 0) {
      this.noObjects = true;
    }
  }

  onClear() {
    this.db.clearEntries();
  }
}
