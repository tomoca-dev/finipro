# Admin-only login update

This version changes authentication to the requested locked-down model:

- Public signup is removed from the UI.
- Login accepts either a real email or a username/login code such as `admin@2024`.
- `admin@2024` resolves to `btesfaye236@gmail.com`.
- Users are created only from the Admin page.
- Admin-created users are created through the Supabase Edge Function `admin-create-user`.
- Admin can assign roles such as CEO, Accountant, Finance Admin, Manager, Cashier, Auditor, Operations, and Viewer.

## Required Supabase steps

1. Run your Modern + Sage SQL schemas first.
2. Run `supabase/sql/admin_only_auth_patch.sql`.
3. In Supabase Auth, manually create `btesfaye236@gmail.com` with your password.
4. Run:

```sql
select public.bootstrap_platform_admin();
```

5. Link admin to your organization as owner if not already linked.
6. Deploy the Edge Function:

```bash
supabase functions deploy admin-create-user
```

7. Make sure the Edge Function has environment variables:

```bash
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

8. In Supabase Dashboard, disable public email signup.

## Frontend env

Use:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

## Login

Admin can log in with either:

- `admin@2024`
- `btesfaye236@gmail.com`

using the password set in Supabase Auth.
