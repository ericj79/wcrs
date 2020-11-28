import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireObject } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { GoalData } from './models/entries';

@Injectable({
  providedIn: 'root',
})
export class FireDbService {
  private static readonly dbPath = '/';
  private static readonly dbEntries = '/entries';
  public myEntries: Array<string> = [];

  private dataRef: AngularFireObject<GoalData>;

  constructor(private db: AngularFireDatabase) {
    this.dataRef = db.object(FireDbService.dbPath);
  }

  getAll(): Observable<GoalData | null> {
    return this.dataRef.valueChanges();
  }

  addHour() {
    const guid = this.guidGenerator();
    const obj = {
      [guid]: {
        time: new Date().toISOString(),
      },
    };
    const promise = this.db.object(FireDbService.dbEntries).update(obj);
    const list = this.myEntries;
    promise.then(() => {
      list.push(guid);
    });
  }

  removeHour() {
    const obj = this.myEntries.pop();
    this.db.object(FireDbService.dbEntries + '/' + obj).remove();
  }

  clearEntries() {
    this.db.object(FireDbService.dbEntries).set(null);
    this.myEntries = [];
  }

  private guidGenerator() {
    var S4 = function () {
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (
      S4() +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      '-' +
      S4() +
      S4() +
      S4()
    );
  }
}
