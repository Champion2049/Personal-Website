# Overview

This is a creative developer portfolio application built with React, TypeScript, and Express.js. The project features a modern, animated portfolio website with smooth scrolling, interactive elements, and a comprehensive UI component library. It's designed to showcase a developer's skills, projects, and experience through an engaging visual interface with advanced animations and creative design elements.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

The frontend is built using **React 18** with **TypeScript** and follows a component-based architecture. The application uses **Vite** as the build tool for fast development and optimized production builds.

**Key Frontend Decisions:**
- **React Router Alternative**: Uses `wouter` for lightweight client-side routing
- **State Management**: Leverages React Query (`@tanstack/react-query`) for server state management and caching
- **Styling**: Implements Tailwind CSS with custom CSS variables for theming and responsive design
- **Component Library**: Built on Radix UI primitives with custom styling using shadcn/ui pattern
- **Animation Framework**: Integrates Framer Motion for complex animations and GSAP for advanced scroll-triggered effects

## Backend Architecture

The backend uses **Express.js** with TypeScript in ESM format. It implements a RESTful API architecture with a modular storage abstraction layer.

**Key Backend Decisions:**
- **Development Server**: Custom Vite integration for seamless development experience with HMR
- **Storage Pattern**: Abstract storage interface (`IStorage`) with in-memory implementation for development
- **Middleware**: Request logging with timing and response capture for API routes
- **Error Handling**: Centralized error handling middleware with structured error responses

## Animation and UX Features

**Advanced Animation System:**
- **Smooth Scrolling**: Lenis integration for buttery-smooth scroll behavior
- **Scroll Progress**: Visual progress indicator for page navigation
- **Custom Cursor**: Interactive cursor that responds to hover states
- **Motion Library**: Framer Motion for component animations and page transitions
- **GSAP Integration**: Optional GSAP support for complex scroll-triggered animations

## Development Workflow

**Build and Development:**
- **Hot Module Replacement**: Vite-powered development with instant updates
- **TypeScript**: Strict type checking with path mapping for clean imports
- **ESM**: Modern JavaScript modules throughout the stack
- **Development Tools**: Replit-specific plugins for runtime error overlay and cartographer integration

# External Dependencies

## Database and Storage
- **Database ORM**: Drizzle ORM configured for PostgreSQL with Neon Database serverless driver
- **Schema Management**: Drizzle Kit for database migrations and schema management
- **Development Storage**: In-memory storage implementation for rapid prototyping

## UI and Animation Libraries
- **Component Primitives**: Radix UI for accessible, unstyled components
- **Styling Framework**: Tailwind CSS with custom design system
- **Animation Libraries**: 
  - Framer Motion for React component animations
  - GSAP (optional) for advanced scroll animations
  - Lenis for smooth scrolling behavior

## Development and Build Tools
- **Build Tool**: Vite with React plugin and TypeScript support
- **Package Manager**: NPM with ESM module format
- **Development Server**: Express with Vite middleware integration
- **Type Checking**: TypeScript with strict configuration

## Third-Party Integrations
- **Font Loading**: Google Fonts integration (Inter, Space Grotesk, JetBrains Mono)
- **Image Sources**: Unsplash for placeholder and stock photography
- **Icons**: Lucide React for consistent iconography
- **Replit Platform**: Custom plugins for development environment integration