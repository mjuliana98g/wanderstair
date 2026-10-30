# Wanderstair

**Live site:** https://mjuliana98g.github.io/wanderstair/

Wanderstair is a diary shaped like a staircase. Every memory is a door on the stair. Opening a door leads to a room with a letter (what happened that day) and an exhibition of paintings from the Cleveland Museum of Art. Friends can send each other postcards with a piece of their day and answer with a painting that hangs in the other person's room.

## Features

- **Accounts** – create an account, sign in, sign out, reset a forgotten password, change name and password, delete the account.
- **The stair** – memories shown as doors, newest at the top. The colour of each door comes from its strongest feeling.
- **Portrait of the day** – a different portrait from the museum every day.
- **Write and edit memories** – title, date, up to three feelings in order of strength, a door style and the letter. An unsent letter is kept while the tab is open.
- **Rooms** – read the letter, hang or take down paintings, edit the memory or close the door (with confirmation).
- **Find artworks** – search the museum while typing, open a painting's details and hang it in a room.
- **Friends** – send, accept, decline and cancel friend requests by email.
- **Postcards** – send a painting and a message from a room to a friend. The friend can answer with a painting, which hangs in your room in a pink frame with their note.
- **Notifications** – a red dot on Friends and Postcards when something new is waiting.
- **Account page** – how many doors and paintings you have and which feelings appear most.
- **Day and night themes** – the choice is remembered.
- **Responsive** – works on computers, tablets and phones.

## Data sources

- **[Cleveland Museum of Art Open Access API](https://openaccess-api.clevelandart.org/)** – all paintings, searched and loaded with `HttpClient`. The images are Open Access (CC0).
- **[Supabase](https://supabase.com/)** – authentication and the database (memories, feelings, doors, friendships, postcards and gifts). Row Level Security makes sure each person only reads and changes their own data.

## Built with

- Angular 22 (standalone components, signals, new control flow)
- TypeScript
- RxJS
- Supabase JS client
- GitHub Actions and GitHub Pages

## Run it locally

You need [Node.js](https://nodejs.org/) and a Supabase project with the Wanderstair tables.

1. Clone the repository and install the dependencies:

   ```bash
   git clone https://github.com/mjuliana98g/wanderstair.git
   cd wanderstair
   npm install
   ```

2. Create the folder `src/environments` with two files, `environment.ts` and `environment.development.ts`, both with this content (use your own Supabase URL and publishable key):

   ```ts
   export const environment = {
     supabaseURL: 'https://your-project.supabase.co',
     supabaseKey: 'your-publishable-key',
   };
   ```

   This folder is in `.gitignore`, so the key is never committed.

3. Start the development server and open http://localhost:4200/:

   ```bash
   ng serve
   ```

## Deployment

Every push to `main` runs the GitHub Actions workflow in `.github/workflows`. It:

1. installs the dependencies,
2. creates `environment.ts` from the repository secrets `SUPABASEURL` and `SUPABASEKEY`,
3. builds the production version with the base path `/wanderstair/`,
4. publishes it to GitHub Pages.

## Project structure

```
src/app/
├── components/   reusable pieces (frame, postcard)
├── guards/       auth guard for private pages
├── models/       interfaces and types
├── pages/        one folder per page (stair, room, find, write, friends, postcards, account…)
├── services/     data access (auth, memories, museum, friends, postcards, gifts, Supabase)
└── validators/   custom form validators
```

## Author

Matilde Gomes