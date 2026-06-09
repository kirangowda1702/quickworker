# QuickWorker 🛠️

QuickWorker is a professional, premium doorstep services booking platform designed specifically for Hassan, Karnataka. It connects clients with verified home service professionals (electricians, plumbers, carpenters, beauticians, and cleaners) in real time.

The application is built as a Progressive Web App (PWA) with complete, real-time database persistence on Google Firebase Firestore, secure email/Google authentication, and auto-seeding database features.

---

## 🚀 Key Features

* **Real-time Firestore Database Persistence**: All bookings, status updates, cancellations, notifications, and reviews sync instantly and persist permanently across all devices.
* **Bi-directional Dashboards**:
  * **Customer Dashboard**: Track active and historical service booking orders, reschedule, download invoices, submit reviews, and view notifications.
  * **Worker Dashboard**: Set availability toggle, accept/reject jobs, update progress timeline ("Worker on the Way" ➡️ "In Progress" ➡️ "Completed"), and view earnings.
  * **Admin Panel**: Manage service partner profiles, register new professionals, delete user profiles, and add new service categories.
* **Automatic Database Seeding**: Automatic database population checks on startup. Seeds 32 categories and 600 Hassan-based workers using Firestore `writeBatch` if empty.
* **Progressive Web App (PWA)**: Add-to-Home-Screen support for Android/iOS with custom branding icons, offline asset caching, and standalone fullscreen UI.
* **AI Chatbot**: Intelligent automated chatbot assistant to search for services, pricing, coordinates locality details, and support inquiries.
* **Secure File Uploads**: Firebase Storage integration for worker profiles, ID proofs, and portfolio images with size validation and network timeout protection.

---

## 🛠️ Technology Stack

* **Core**: React, Vite, TypeScript, Tailwind CSS, Framer Motion
* **Database & Auth**: Google Firebase Auth, Cloud Firestore, Firebase Storage
* **PWA Engine**: `vite-plugin-pwa` (Workbox)
* **Hosting**: Vercel (Production Build & GitHub Autodeploy)

---

## 📂 Database Collections Schema

QuickWorker relies on 5 core collections in Cloud Firestore:

1. **`users`**: Customer profiles, email IDs, roles (`customer` / `worker` / `admin`), and timestamps.
2. **`workers`**: Directory listing profiles, experience, categories, rates, geolocations, ratings, and verified status.
3. **`bookings`**: Booking records including display IDs (`QW-XXXXXX`), timestamps, payment status (`Paid Online` / `COD`), service address, and progress statuses.
4. **`notifications`**: Real-time notifications for bookings confirmations, progress events, and cancellations.
5. **`reviews`**: Verified customer reviews containing ratings and messages that recalculate worker average ratings in real time.

---

## 💻 Local Installation & Setup

Follow these steps to run the project locally on your machine:

### 1. Clone the Repository
```bash
git clone https://github.com/kirangowda1702/quickworker.git
cd quickworker
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the root directory and add your Firebase configuration credentials:
```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
To compile the TypeScript project and generate the static build directory (including PWA service workers):
```bash
npm run build
```

---

## ⚡ Production Deployment

This project is optimized for deployment on Vercel. 

1. Push your changes to your remote GitHub repository (`main` branch).
2. Connect your GitHub repository to **Vercel**.
3. Add the matching Environment Variables (from your `.env` file) inside the Vercel project settings.
4. Vercel will automatically trigger a new production build and host it securely upon every subsequent git push.

---

## 🔒 Security & Safe Persistence
* Environment files (`.env`, `.env.local`) and credentials deployment scripts (`set_env.ps1`) are excluded from Git tracing via `.gitignore`.
* Database Firestore security rules (`firestore.rules`) enforce user validation on reading, writing, and admin-only modifications.
* Sanitized payloads ensure all `undefined` values are completely removed before write requests are fired to Firestore.
