import { Routes } from '@angular/router';

import { Stair } from './pages/stair/stair';
import { Room } from './pages/room/room';
import { Find } from './pages/find/find';

export const routes: Routes = [
  { path: '', component: Stair },
  { path: 'room/:id', component: Room },
  { path: 'find', component: Find }
];