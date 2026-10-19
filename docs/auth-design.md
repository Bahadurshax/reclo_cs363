# Email and password authentication: design (KAN-16 / KAN-66)

## Decisions

- Email + password. Passwords hashed with argon2id (`argon2` package).
- Server-side sessions. The browser holds a random opaque token in an `httpOnly`, `SameSite=Lax` cookie
  (`Secure` in production). The database stores only the SHA-256 hash of the token.
- Sessions expire after 7 days. Logout deletes the session row.
- Public sign-up always creates a `CLIENT`. `role` is never read from a request body.
- Login failures never reveal whether the email exists: one message, one status (401).
- Rate limiting on `POST /api/auth/register` and `POST /api/auth/login`.

## Data model (Prisma)

```prisma
enum Role {
  CLIENT
  VENDOR
  ADMIN
}

model User {
  id           String    @id @default(uuid())
  email        String    @unique // stored trimmed + lowercased
  passwordHash String
  role         Role      @default(CLIENT)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt
  sessions     Session[]
}

model Session {
  id        String   @id @default(uuid())
  tokenHash String   @unique // SHA-256 hex of the cookie token
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
}
```

## Shared Zod schemas (`packages/shared/src/auth.ts`)

```ts
roleSchema = z.enum(['CLIENT', 'VENDOR', 'ADMIN'])

emailSchema = z.string().trim().toLowerCase().pipe(z.email())
registerRequestSchema = z.object({ email: emailSchema, password: z.string().min(8).max(128) })
loginRequestSchema = z.object({ email: emailSchema, password: z.string().min(1) })
publicUserSchema = z.object({ id: z.string(), email: z.string(), role: roleSchema })
authResponseSchema = z.object({ user: publicUserSchema })
apiErrorSchema = z.object({
  error: z.string(),
  fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
})
```

Unknown keys are stripped: a `role` in the register body has no effect.
Login only requires a non-empty password so that the form never leaks the password policy as a login error.

## API contract

All routes are under `/api/auth`, JSON in and out. The web app calls them with `credentials: 'include'`.

| Route            | Body                  | Success                                               | Errors                                                                                             |
| ---------------- | --------------------- | ----------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `POST /register` | `{ email, password }` | `201 { user }` + `Set-Cookie` (signed in immediately) | `400` validation `{ error, fieldErrors }`; `409` `{ error: "Email is already registered" }`; `429` |
| `POST /login`    | `{ email, password }` | `200 { user }` + `Set-Cookie`                         | `400` validation; `401` `{ error: "Invalid email or password" }`; `429`                            |
| `POST /logout`   | none                  | `204`, session deleted, cookie cleared (idempotent)   | none                                                                                               |
| `GET /me`        | none                  | `200 { user }`                                        | `401` `{ error: "Not authenticated" }`                                                             |

Middleware for later tasks: `requireAuth` (401 without a valid, unexpired session; sets `req.user`) and
`requireRole(...roles)` (401 if unauthenticated, 403 `{ error: "Forbidden" }` if the role does not match).

Cookie: name `reclo_session`, `httpOnly`, `sameSite: 'lax'`, `path: '/'`, `maxAge` 7 days, `secure` when `NODE_ENV=production`.
Expired sessions are rejected (and may be deleted lazily on lookup).

## Screens

Both pages: full-height centered `<main>`, one `Card` (`w-full max-w-sm`). All strings live in a `copy`
object at the top of each page file, ready for the KAN-19 translation task.

### Sign up (`/sign-up`)

```
Card
├─ CardHeader: CardTitle "Create your account", CardDescription "Sign up to browse and request billboards"
├─ CardContent: <form>
│   └─ FieldGroup
│       ├─ Field (data-invalid) : FieldLabel "Email"    + Input type=email autoComplete=email    + FieldError
│       ├─ Field (data-invalid) : FieldLabel "Password" + Input type=password autoComplete=new-password
│       │                         + FieldDescription "At least 8 characters" + FieldError
│       └─ Button type=submit (full width)
└─ CardFooter: "Already have an account?" + link "Sign in" -> /sign-in
```

### Sign in (`/sign-in`)

Same layout. Title "Welcome back", description "Sign in to your account". Fields: Email, Password
(`autoComplete=current-password`). Button "Sign in". Footer: "No account yet?" + link "Sign up" -> /sign-up.

### States

- **Idle**: button enabled, no errors.
- **Client validation**: on submit (then on change) the shared Zod schema runs via `zodResolver`; messages
  render in `FieldError` under the field and set `aria-invalid` on the `Input`.
- **Loading**: while the mutation is pending the button is `disabled` and reads "Creating account…" /
  "Signing in…"; inputs are disabled.
- **Server field error** (`400` with `fieldErrors`): mapped onto the matching field via `setError`.
- **Server error** (`401`, `409`, `429`, `5xx`, network): a `sonner` toast with the server message
  (`409` also marks the email field). `401` shows "Invalid email or password".
- **Success**: the `me` query is refreshed and the user is redirected to `/`.
- **Already signed in**: visiting `/sign-in` or `/sign-up` redirects to `/`.
- **Home page**: shows a "Sign out" `Button` (variant outline) and the user's email when signed in.
- **Auth loading** (initial `GET /me`): auth pages render nothing until it resolves, to avoid a flash.

## Out of scope

Email verification, password reset, OAuth, vendor-account creation by admins (KAN-13), translations (KAN-19).
