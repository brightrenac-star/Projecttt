# Society - Creator Support Platform

## Overview

Society is a full-stack web application that connects creators with supporters through a content subscription and tipping platform. The application enables creators to share exclusive content, build communities, and monetize their work while providing supporters with direct access to their favorite creators. Built with modern web technologies, it features a React frontend with TypeScript, an Express.js backend, and PostgreSQL database with Drizzle ORM.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Library**: Radix UI components with shadcn/ui design system for consistent, accessible interfaces
- **Styling**: Tailwind CSS with custom CSS variables for theming and glassmorphism effects
- **Routing**: Wouter for client-side routing with protected routes for authenticated users
- **State Management**: TanStack React Query for server state management and caching
- **Authentication**: Context-based auth provider with JWT token handling

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy using session-based auth
- **Password Security**: Node.js crypto module with scrypt for password hashing
- **Session Storage**: In-memory session store with express-session
- **API Design**: RESTful endpoints with proper HTTP status codes and error handling

### Database & ORM
- **Database**: PostgreSQL configured for production deployment
- **ORM**: Drizzle ORM with schema-first approach for type-safe database operations
- **Migration System**: Drizzle Kit for database schema migrations
- **Schema Design**: Normalized relational structure with users, creators, posts, subscriptions, tips, and likes tables

### Data Models
- **Users**: Authentication and profile management with role-based access (creator/supporter)
- **Creators**: Extended profiles with handles, bios, avatars, subscription tiers, and earnings tracking
- **Posts**: Content management with visibility controls (public/members/pay-per-view) and media support
- **Subscriptions**: Recurring supporter relationships with tier-based access
- **Tips**: One-time payments with optional messages
- **Likes**: Social engagement tracking for posts

### Development & Deployment
- **Build System**: Vite for frontend bundling with esbuild for backend compilation
- **Development**: Hot module replacement and error overlay for rapid development
- **Environment**: Replit-optimized with runtime error handling and cartographer integration
- **Code Quality**: TypeScript strict mode with comprehensive type checking

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Neon Database serverless driver for PostgreSQL connections
- **drizzle-orm**: Type-safe ORM for database operations
- **@tanstack/react-query**: Server state management and data fetching
- **wouter**: Lightweight React router for client-side navigation
- **passport**: Authentication middleware for Express.js

### UI & Styling
- **@radix-ui/***: Comprehensive collection of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework for rapid UI development
- **class-variance-authority**: Utility for creating type-safe component variants
- **clsx**: Conditional className utility

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking for JavaScript
- **esbuild**: Fast JavaScript bundler for production builds
- **tsx**: TypeScript execution engine for Node.js

### Session & Storage
- **express-session**: Session middleware for Express.js
- **connect-pg-simple**: PostgreSQL session store adapter
- **memorystore**: In-memory session storage fallback

### Validation & Utilities
- **zod**: Runtime type validation and schema parsing
- **date-fns**: Modern date utility library
- **nanoid**: URL-safe unique string ID generator