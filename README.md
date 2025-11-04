# AnyTimeTeacher AI - Next.js

AI-powered assistant for creating comprehensive lesson plans from NCERT chapters.

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **MongoDB** running on `localhost:27017`
- **Google Cloud** service account (for file storage)
- **Google OAuth** credentials (for authentication)
- **Google Gemini API** key (for AI features)

### Setup Steps

1. **Install dependencies** (already done if `node_modules` exists):
   ```bash
   cd att-next
   npm install
   ```

2. **Environment variables** (✅ Already configured):
   - `.env.local` is already created with all required variables
   - `gcs-service-account.json` is already copied to the project root

3. **Start MongoDB** (if not already running):
   ```bash
   # macOS with Homebrew
   brew services start mongodb-community
   
   # Or run MongoDB manually
   mongod --dbpath /path/to/data
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser**:
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
att-next/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (auth)/         # Authentication pages
│   │   ├── (dashboard)/    # Dashboard pages
│   │   └── api/            # API routes
│   ├── components/         # React components
│   ├── context/            # React context providers
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Backend utilities & models
│   │   ├── models/         # MongoDB models
│   │   ├── auth.js         # Authentication middleware
│   │   ├── database.js     # MongoDB connection
│   │   ├── geminiService.js # AI services
│   │   └── storageService.js # GCS services
│   └── services/           # Frontend API service
├── .env.local              # Environment variables
└── gcs-service-account.json # Google Cloud credentials
```

## 🔧 Configuration

### Environment Variables

All required environment variables are in `.env.local`:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` & `JWT_REFRESH_SECRET` - JWT tokens
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - OAuth credentials
- `GEMINI_API_KEY` - Google Gemini API key
- `GCS_*` - Google Cloud Storage configuration

### API Routes

All backend routes are in `src/app/api/`:
- `/api/auth/*` - Authentication (OAuth, tokens)
- `/api/users/*` - User management
- `/api/classes/*` - Class CRUD operations
- `/api/chapters/*` - Chapter management & upload
- `/api/tests/*` - Test creation & management
- `/api/attempts/*` - Student test attempts
- `/api/analysis/*` - Performance analysis

## 🏃 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server

## 🔐 Authentication

The app uses **JWT-based authentication** (not Next.js Auth):
- Google OAuth for initial login
- JWT access tokens for API requests
- Refresh tokens for token renewal
- All API routes are protected with middleware

## 📝 Notes

- Database connection is initialized per API route
- All components are client-side (`'use client'` directive)
- Context providers are available globally via root layout
- API routes use relative paths (`/api/*`) in development

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `brew services list | grep mongodb`
- Check connection string in `.env.local`

### Google OAuth Error
- Verify `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`
- Check that `GOOGLE_CALLBACK_URL` matches your Google Cloud Console settings

### File Upload Error
- Verify `gcs-service-account.json` exists and has correct permissions
- Check GCS bucket name and project ID in `.env.local`

## ✅ Migration Status

Migration from Vite + Fastify to Next.js 15+ is **100% complete**:
- ✅ All backend routes ported to Next.js API routes
- ✅ All components converted from TypeScript to JavaScript
- ✅ All contexts and hooks converted
- ✅ Database models and services ported
- ✅ Authentication and authorization working
- ✅ File upload and AI services integrated
