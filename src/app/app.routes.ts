import { Routes } from '@angular/router';

import { Stair } from './pages/stair/stair';
import { Room } from './pages/room/room';
import { Find } from './pages/find/find';
import { Write } from './pages/write/write';
import { NotFound } from './pages/not-found/not-found';
import { ArtworkDetail } from './pages/artwork-detail/artwork-detail';
import { SignIn } from './pages/sign-in/sign-in';
import { CreateAccount } from './pages/create-account/create-account';
import { authGuard } from './guards/auth-guard';
import { Account } from './pages/account/account';
import { Friends } from './pages/friends/friends';
import { SendPostcard } from './pages/send-postcard/send-postcard';
import { Postcards } from './pages/postcards/postcards';
import { PostcardView } from './pages/postcard-view/postcard-view';
import { AnswerPostcard } from './pages/answer-postcard/answer-postcard';
import { ForgotPassword } from './pages/forgot-password/forgot-password';
import { ResetPassword } from './pages/reset-password/reset-password';

export const routes: Routes = [
  { path: 'sign-in', component: SignIn },
  { path: 'create-account', component: CreateAccount },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'reset-password', component: ResetPassword },
  {
    path: '',
    canActivate: [authGuard],
    children: [
      { path: '', component: Stair },
      { path: 'room/:id', component: Room },
      { path: 'room/:id/edit', component: Write },
      {
        path: 'find',
        component: Find,
        children: [{ path: 'artwork/:id', component: ArtworkDetail }],
      },
      { path: 'write', component: Write },
      { path: 'artwork/:id', component: ArtworkDetail },
      { path: 'account', component: Account },
      { path: 'friends', component: Friends },
      { path: 'room/:id/send/:artworkId', component: SendPostcard },
      { path: 'postcards', component: Postcards },
      { path: 'postcards/:id', component: PostcardView },
      { path: 'postcards/:id/answer', component: AnswerPostcard },
    ],
  },
  { path: '**', component: NotFound },
];