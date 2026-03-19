# AI Rules for Uniseguros Control Center

This document outlines the core technologies and library usage guidelines for the Uniseguros Control Center application. Adhering to these rules ensures consistency, maintainability, and leverages the strengths of our chosen tech stack.

## Tech Stack Overview

*   **Frontend Framework**: React with TypeScript
*   **Build Tool**: Vite
*   **UI Component Library**: shadcn/ui (built on Radix UI)
*   **Styling**: Tailwind CSS
*   **Routing**: React Router DOM
*   **Server State Management**: React Query
*   **Animations**: Framer Motion
*   **Date Manipulation**: `date-fns`
*   **Backend API**: Node.js with Express
*   **Database**: Supabase (PostgreSQL)
*   **Authentication**: JWT (JSON Web Tokens)

## Library Usage Guidelines

To maintain a consistent and efficient codebase, please follow these guidelines for library usage:

1.  **UI Components**: Always use `shadcn/ui` components for all user interface elements. If a specific component is not available in `shadcn/ui`, create a new, small component in `src/components/` following `shadcn/ui`'s styling and structure, rather than introducing new UI libraries.
2.  **Styling**: Utilize Tailwind CSS exclusively for all styling. Avoid inline styles or custom CSS files unless absolutely necessary for very specific, isolated cases (e.g., global resets in `index.css`).
3.  **Routing**: Use `react-router-dom` for all client-side navigation. Keep route definitions centralized in `src/App.tsx`.
4.  **Server State Management**: For fetching, caching, and updating server data, use `React Query`. This includes all API interactions with the backend.
5.  **Animations**: Implement UI animations and transitions using `Framer Motion`.
6.  **Date Handling**: For any date formatting, parsing, or manipulation, use `date-fns`.
7.  **Form Management**: For forms, use `react-hook-form` combined with `zod` for schema validation.
8.  **Toast Notifications**: For transient, non-blocking notifications, use `sonner` (imported as `Sonner` in `App.tsx`). For more traditional, dismissible toasts, use the `useToast` hook from `@/hooks/use-toast` (which wraps `shadcn/ui`'s `Toast` component).
9.  **Icons**: All icons should be sourced from `lucide-react`.
10. **API Interaction**: All frontend interactions with the backend API should go through the centralized `src/lib/api.ts` service. Do not make direct `fetch` calls elsewhere.
11. **Utility Functions**: For combining Tailwind classes, use `cn` from `src/lib/utils.ts`.

By adhering to these rules, we ensure a cohesive and high-quality application.