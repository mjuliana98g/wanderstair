import { Routes } from '@angular/router';
import { Stair } from './pages/stair/stair';
import { Room } from './pages/room/room';

export const routes: Routes = [
  { path: '', component: Stair },
  { path: 'room/:id', component: Room }
];