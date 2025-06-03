# RootwiseCode


RootWise is a React Native mobile application built with Expo that helps users identify plant diseases through image recognition. This repository contains the frontend code only — it relies on backend services provided via [Appwrite](https://appwrite.io/) and an external machine learning prediction API (e.g., hosted on Microsoft Azure or your own Flask server).

⚙️ Tech Stack

- React Native (with Expo)
- Appwrite (for authentication, storage, and database)
- External ML backend (for plant disease prediction)
- TypeScript
- Tailwind (via NativeWind)
- EAS Build


### 🚀 Getting Started

### 1. Clone the Repo

``` 
git clone https://github.com/cherryindian/RootWise.git
cd RootWise
````

### 2. Install Dependencies

``` 
npm install
```

or

``` 
yarn
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root of the project and add the following keys:

```env
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://your-appwrite-endpoint/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your-database-id
EXPO_PUBLIC_APPWRITE_DISEASES_COLLECTION_ID=your-diseases-collection-id
EXPO_PUBLIC_APPWRITE_USERIMAGE_COLLECTION_ID=your-userimage-collection-id
EXPO_PUBLIC_APPWRITE_STORAGE_ID=your-storage-id
```

> ⚠️ These values are specific to your Appwrite backend setup. You can find them in your Appwrite console.

---

## 🧠 ML Backend Configuration

To enable prediction functionality, you must update the backend API endpoint in the following files:

* `\app\components\Camera.tsx`
* `\app\components\GalleryUpload.tsx`

Look for a line like this:

```ts
const response = await axios.post("https://your-ml-backend-url.com/predict", formData);
```

Replace the URL with your own hosted model URL (e.g., a Flask app on Microsoft Azure, Render, or Railway).

---

## 📱 Running the App Locally

You can run the app in development mode using Expo Go (Android preferred).

``` 
npx expo start
```

Scan the QR code from your Android device (Expo Go app) to open the project.

---

## 📦 Building for Production

If you're using EAS Build, update your `eas.json` with production values like so:

```json
"production": {
  "env": {
    "EXPO_PUBLIC_APPWRITE_ENDPOINT": "https://your-appwrite-endpoint/v1",
    "EXPO_PUBLIC_APPWRITE_PROJECT_ID": "your-project-id",
    "EXPO_PUBLIC_APPWRITE_DATABASE_ID": "your-database-id",
    "EXPO_PUBLIC_APPWRITE_DISEASES_COLLECTION_ID": "your-diseases-collection-id",
    "EXPO_PUBLIC_APPWRITE_USERIMAGE_COLLECTION_ID": "your-userimage-collection-id",
    "EXPO_PUBLIC_APPWRITE_STORAGE_ID": "your-storage-id"
  }
}
```

Then build:

``` 
eas build -p android --profile production
```

---

## 📌 Features

* 🌿 Plant disease detection using image upload or camera
* 🔐 Google OAuth login via Appwrite
* 💾 Stores user-uploaded images and prediction results
* 🧑 Profile with avatar support
* 📊 Disease database listing with search
* 📁 Cloud storage via Appwrite Buckets
* 📨 Email contact, sharing, and review options

---

## 👥 Contributors

This project was built by three Computer Science students as part of a semester project.

We hope it helps farmers, students, and botany enthusiasts identify and manage plant diseases easily.

---
