# Medium Clone - Blog Platform

A modern blog platform built with Next.js, featuring user authentication, rich text editing, and image uploads.

## Features

- **User Authentication** - JWT-based login/signup system
- **Rich Text Editor** - Create and edit posts with formatting
- **Image Upload** - Cloudinary integration for cover images
- **Post Management** - Create, edit, delete, and publish posts
- **Social Features** - Like posts, follow authors, comments
- **Responsive Design** - Works on desktop and mobile
- **Search & Explore** - Discover posts and authors

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Image Storage**: Cloudinary
- **UI Components**: Shadcn/ui

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Cloudinary account

### Installation

1. Clone the repository

git clone <repository-url>
cd code


2. Install dependencies

npm install


3. Set up environment variables

cp .env.example .env


Fill in your environment variables:
env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-jwt-secret"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"


4. Set up the database

npx prisma migrate dev


5. Run the development server

npm run dev


Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure


├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── explore/           # Explore page
│   ├── login/             # Authentication pages
│   ├── post/              # Individual post pages
│   ├── write/             # Post creation/editing
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # UI components
│   ├── post-card.tsx     # Post display component
│   └── rich-text-editor.tsx
├── lib/                   # Utilities and configurations
│   ├── auth-context.tsx  # Authentication context
│   ├── prisma.ts         # Database client
│   └── cloudinary.ts     # Image upload utilities
├── prisma/               # Database schema and migrations
└── public/               # Static assets


## Key Features

### Authentication
- Secure JWT-based authentication
- Protected routes and API endpoints
- User profile management

### Post Management
- Rich text editor with formatting options
- Draft and publish functionality
- Cover image upload via Cloudinary
- SEO-friendly slugs

### Social Features
- Like/unlike posts
- Follow/unfollow authors
- Comment system
- User profiles

### Content Discovery
- Explore page with latest posts
- Search functionality
- Tag-based filtering
- Personalized feed for followed authors

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/[id]` - Get single post
- `PUT /api/posts/[id]` - Update post
- `DELETE /api/posts/[id]` - Delete post
- `POST /api/upload` - Upload images

Deployment link:https://capstone2-delta.vercel.app/