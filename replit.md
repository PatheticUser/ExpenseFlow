# ExpenseFlow

## Overview

ExpenseFlow is a modern full-stack financial task management application built with React and Express. The application automatically converts recurring expenses into manageable monthly tasks, helping users track their financial obligations and never miss payments. It features a comprehensive expense management system with category organization, automated task generation, and an intuitive dashboard for financial oversight.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation for type-safe form management
- **Build Tool**: Vite for fast development and optimized production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules for modern JavaScript features
- **Database ORM**: Drizzle ORM for type-safe database operations and schema management
- **Authentication**: Custom Replit OAuth integration with session-based authentication
- **Session Storage**: PostgreSQL-based session storage using connect-pg-simple
- **API Design**: RESTful API endpoints with comprehensive error handling and logging
- **Task Scheduling**: Node-cron for automated monthly task generation

### Data Storage
- **Primary Database**: PostgreSQL with Neon serverless hosting
- **Schema Management**: Drizzle Kit for database migrations and schema evolution
- **Session Storage**: PostgreSQL sessions table for authentication persistence
- **Data Models**: Comprehensive schema including users, categories, expenses, financial tasks, and sessions

### Authentication & Authorization
- **Authentication Provider**: Replit OAuth using OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage backend
- **Authorization Pattern**: Middleware-based route protection with user context injection
- **Security Features**: HTTP-only cookies, secure session configuration, and CSRF protection

## External Dependencies

### Core Technologies
- **Database**: Neon PostgreSQL serverless database for scalable data storage
- **Authentication**: Replit OAuth service for seamless user authentication
- **Hosting**: Replit platform with integrated development and deployment environment

### Key Libraries
- **Frontend**: React Query for data fetching, Wouter for routing, Shadcn/ui for components, React Hook Form for forms
- **Backend**: Express.js for server framework, Drizzle ORM for database operations, Passport.js for authentication strategies
- **Development**: Vite for build tooling, TypeScript for type safety, Tailwind CSS for styling
- **Utilities**: Date-fns for date manipulation, Zod for schema validation, Node-cron for scheduling

### Development Tools
- **Build System**: Vite with React plugin and TypeScript support
- **Code Quality**: TypeScript strict mode, ESLint configuration, and automated type checking
- **Development Experience**: Hot module replacement, error overlay, and integrated debugging tools