# Albasha Design - Admin Panel Development

## Design Guidelines
- RTL layout throughout
- Gold accent color (#C6A962) consistent with main site
- Dark sidebar navigation for admin
- Clean, modern dashboard design

## Files to Create/Modify
1. **src/pages/AdminDashboard.tsx** - Main admin layout with sidebar navigation
2. **src/pages/admin/ProductsManager.tsx** - Product CRUD management
3. **src/pages/admin/CategoriesManager.tsx** - Category management
4. **src/pages/admin/ContactInbox.tsx** - Contact submissions inbox
5. **src/pages/admin/TestimonialsManager.tsx** - Testimonials management
6. **src/App.tsx** - Add admin routes
7. **src/lib/api.ts** - Add admin API functions (delete, update, create)

## Features
- Login-protected admin panel (uses existing AuthContext + ProtectedAdminRoute)
- Dashboard overview with stats
- Products: list, add, edit, delete
- Categories: list, add, edit, delete
- Contact submissions: view inbox, mark as read
- Testimonials: list, add, edit, delete