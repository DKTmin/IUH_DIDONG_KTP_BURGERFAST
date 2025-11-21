# BurgerFast Admin

Admin panel scaffold for managing BurgerFast app.

Features included in scaffold:

- Product management (CRUD placeholders)
- Orders list with status update (updates Firestore `orders` collection)
- Dashboard with revenue statistics (day/month/year aggregation)

Quick start

1. cd into project
   ```powershell
   cd d:/LTDDBurgerMomo/IUH_DIDONG_KTP_BURGERFAST_ADMIN
   npm install
   ```
2. Create a `.env` file with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```
3. Run dev server
   ```powershell
   npm run dev
   ```

Notes

- This is a minimal scaffold; secure access (auth & roles) should be added before production use.
- The UI uses Tailwind CSS; tweak styles in `src/index.css` and `tailwind.config.cjs`.

Admin setup (role-based access)

- Create an `admins` collection in Firestore. Add documents where the document ID is the admin user's `uid` (from Firebase Authentication). For example: `admins/{uid}` with `{ role: 'admin' }`.
- The admin panel uses Firebase Authentication for sign-in and checks the `admins/{uid}` document to allow access. Only users with a document in `admins` can access protected admin routes.

Steps:

1. Register the admin user in Firebase Auth (email/password or any provider).
2. Create a document in Firestore `admins` collection with the document ID equal to the user's `uid`.
3. Sign into the admin panel at `/login`.
