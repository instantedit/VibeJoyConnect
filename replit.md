# VibeJoy - AI-Powered Freelance Job Matching Platform

## Overview

VibeJoy is an AI-driven job board platform that connects freelancers with employers through intelligent matching algorithms. The platform uses advanced AI to analyze skills, experience, and cultural fit to create perfect matches between talent and opportunities. Unlike traditional job boards, VibeJoy focuses on "vibe-based" matching, considering not just technical skills but also work style preferences and cultural alignment.

The application features automated job posting enhancement, AI-powered cover letter generation, intelligent freelancer-job matching with scoring, and comprehensive user management for both employers and freelancers.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built with React 18 using TypeScript and follows a component-based architecture. The application uses Wouter for client-side routing and TanStack Query for state management and API communication. The UI is built with shadcn/ui components and Radix UI primitives, styled with Tailwind CSS. The build system uses Vite for fast development and production builds.

Key architectural decisions:
- **Component Library**: shadcn/ui provides a consistent design system with customizable components
- **State Management**: TanStack Query handles server state, API caching, and background updates
- **Routing**: Wouter provides lightweight client-side routing without unnecessary complexity
- **Styling**: Tailwind CSS with CSS variables for theme customization and design tokens

### Backend Architecture
The backend follows a RESTful API architecture built with Express.js and TypeScript. The application uses a layered approach with separate modules for routing, authentication, storage, and AI services.

Key architectural decisions:
- **Framework**: Express.js chosen for its simplicity and extensive middleware ecosystem
- **Authentication**: Passport.js with local strategy using bcrypt for password hashing
- **Session Management**: PostgreSQL-backed sessions using connect-pg-simple
- **AI Integration**: OpenAI GPT-5 integration for job matching, description enhancement, and cover letter generation
- **API Design**: RESTful endpoints with consistent error handling and JSON responses

### Data Storage Solutions
The application uses PostgreSQL as the primary database with Drizzle ORM for type-safe database interactions. The database is hosted on Neon (serverless PostgreSQL) for scalability and performance.

Database schema includes:
- **Users**: Supports both freelancer and employer user types with profile information
- **Freelancer Profiles**: Extended profiles with skills, portfolio, rates, and availability
- **Jobs**: Job postings with skills requirements, budget, and project details
- **Applications**: Job applications with AI-generated match scores
- **Reviews and Messages**: Communication and feedback systems

Key decisions:
- **ORM Choice**: Drizzle ORM provides excellent TypeScript integration and performance
- **Database Provider**: Neon serverless PostgreSQL for automatic scaling and connection pooling
- **Schema Design**: Separate tables for different user types while maintaining referential integrity

### Authentication and Authorization
The application implements session-based authentication using Passport.js with local strategy. Sessions are stored in PostgreSQL for persistence across server restarts.

Security features:
- **Password Security**: Scrypt hashing with salt for secure password storage
- **Session Management**: Secure HTTP-only cookies with PostgreSQL session store
- **Route Protection**: Protected routes require authentication, with role-based access control
- **User Types**: Distinct user types (freelancer/employer) with different permissions

### AI Integration Architecture
The platform integrates OpenAI's GPT-5 model for various AI-powered features. The AI service is abstracted into separate functions for different use cases.

AI capabilities:
- **Job Matching**: Analyzes compatibility between freelancer profiles and job requirements
- **Content Enhancement**: Improves job descriptions and generates compelling copy
- **Cover Letter Generation**: Creates personalized application letters
- **Scoring System**: Provides numerical match scores with detailed reasoning

## External Dependencies

### Core Framework Dependencies
- **React 18**: Frontend framework with modern hooks and concurrent features
- **Express.js**: Backend web application framework
- **TypeScript**: Type safety across the entire application stack
- **Vite**: Fast build tool and development server

### Database and ORM
- **PostgreSQL**: Primary database (hosted on Neon)
- **Drizzle ORM**: Type-safe database toolkit and query builder
- **@neondatabase/serverless**: Serverless PostgreSQL client for Neon

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework
- **Radix UI**: Unstyled, accessible UI primitives
- **shadcn/ui**: Component library built on Radix UI
- **Lucide React**: Icon library for consistent iconography

### State Management and API
- **TanStack Query**: Server state management and caching
- **Wouter**: Lightweight client-side routing
- **React Hook Form**: Form handling with validation

### Authentication and Security
- **Passport.js**: Authentication middleware
- **connect-pg-simple**: PostgreSQL session store
- **bcrypt/scrypt**: Password hashing utilities

### AI and External Services
- **OpenAI**: GPT-5 integration for AI-powered features
- **Stripe**: Payment processing for premium features (configured but optional)

### Development and Build Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS processing with Tailwind CSS
- **Drizzle Kit**: Database migration and schema management tools

The application is designed to be deployed on Replit with automatic environment setup and database provisioning.