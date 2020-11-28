export interface EntryInfo {
  time: string;
}

export interface Entry {
  [key: string]: EntryInfo;
}

export interface GoalData {
  goal: number;
  entries: Entry;
}
