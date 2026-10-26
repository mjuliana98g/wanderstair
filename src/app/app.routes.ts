import { Routes } from '@angular/router';

import { Stair } from './pages/stair/stair';
import { Room } from './pages/room/room';
import { Find } from './pages/find/find';
import { Write } from './pages/write/write';
import { NotFound } from './pages/not-found/not-found';
import { ArtworkDetail } from './pages/artwork-detail/artwork-detail';
import { SignIn } from './pages/sign-in/sign-in';

export const routes: Routes = [
  { path: '', component: Stair },
  { path: 'room/:id', component: Room },
  { path: 'find', component: Find },
  { path: 'write', component: Write },
  { path: 'artwork/:id', component: ArtworkDetail },
  { path: 'sign-in', component: SignIn },
  { path: '**', component: NotFound }
];