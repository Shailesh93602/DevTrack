---
description: Code organization and separation of concerns rules for Windsurf agent
tags: [architecture, organization, typescript, react]
---

# Code Organization Rules

## File Structure Standards

### Types and Interfaces

- **ALWAYS** define interfaces and types in dedicated files under `/types/` directory
- **NEVER** define interfaces inline in component files (except small local component props)
- Export types from `/types/index.ts` for centralized access
- Use descriptive type names with proper prefixes (e.g., `DsaProblem`, `ProjectFormData`)

```typescript
// ✅ CORRECT: types/dsa-problem.ts
export interface DsaProblem {
  id: string;
  title: string;
  difficulty: DifficultyLevel;
}

// ❌ WRONG: Defining in component file
interface DsaProblem {
  // inline definition
  id: string;
  title: string;
}
```

### Validation Schemas

- **ALWAYS** place Zod validation schemas in `/lib/validations/` directory
- **NEVER** define validation schemas in component files
- Export both schema and inferred types from validation files
- Use consistent naming: `entitySchema` for schema, `EntityInput` for type

```typescript
// ✅ CORRECT: lib/validations/dsa-problem.ts
export const dsaProblemSchema = z.object({
  title: z.string().min(1).max(200),
});
export type DsaProblemInput = z.infer<typeof dsaProblemSchema>;

// ❌ WRONG: Defining in component
const formSchema = z.object({
  // inline
  title: z.string().min(1),
});
```

### Component Structure

- **MAX 200 lines per file** - Break down larger components
- **NO business logic in UI components** - Use custom hooks in `/hooks/` directory
- **NO API calls in components** - Use service functions or hook-based API calls
- Keep components focused on presentation only

### Custom Hooks

- Place all custom hooks in `/hooks/` directory
- Name hooks with `use` prefix: `useDsaProblemForm`, `useProjectList`
- Hooks should encapsulate:
  - State management
  - Business logic
  - API interactions
  - Form handling

### Constants and Configuration

- **NEVER** hardcode magic numbers/strings in components
- Define constants in dedicated files or at top of hook files
- Use UPPER_SNAKE_CASE for constants

```typescript
// ✅ CORRECT: Constants defined at top
const TITLE_MAX = 200;
const DIFFICULTY_OPTIONS = ["EASY", "MEDIUM", "HARD"] as const;

// ❌ WRONG: Magic numbers in component
<Input maxLength={200} />  // hardcoded
```

### Utility Functions

- Place reusable utilities in `/lib/utils/` directory
- Keep functions pure and well-tested
- Use descriptive names and proper JSDoc comments

## Import Organization

Order imports as follows:

1. React/Next.js imports
2. Third-party libraries
3. Absolute imports (@/components, @/hooks, @/types)
4. Relative imports (./, ../)

## Component Guidelines

### Props Interface

- Define props interface with `ComponentNameProps` naming
- Keep props minimal and focused
- Use composition over configuration

### State Management

- Local state only for UI state (isOpen, isLoading)
- Business state belongs in hooks or context
- Never mix business logic with UI state

### Event Handlers

- Define handlers in hooks or as separate functions
- Keep JSX clean and readable
- Use consistent naming: `handleClick`, `handleSubmit`

## Testing Considerations

- Components should be easy to test (props in, render out)
- Hooks should be independently testable
- Mock services at hook level, not component level

## Enforcement

The following are **STRICT RULES**:

1. No interfaces in component files (move to /types/)
2. No validation schemas in component files (move to /lib/validations/)
3. No business logic in component files (move to /hooks/)
4. No file over 200 lines (break into smaller components)
5. No magic numbers (use named constants)

Breaking these rules will result in:

- Harder maintenance
- More bugs
- Poor code review feedback
- Technical debt
