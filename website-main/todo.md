# Leroy Design - Fix Duplicates & Add Payment

## Tasks

1. **Fix duplicate categories** - Deduplicate by `slug` in `getCategories()` in `api.ts`
2. **Create orders table** - Backend data model for orders with order_items
3. **Create backend payment router** - `backend/routers/payments.py` with create_payment_session and verify_payment
4. **Create CartContext** - Frontend cart state management context
5. **Create Cart page** - View cart items, update quantities, remove items
6. **Create PaymentSuccess page** - Verify payment and show confirmation
7. **Update Header** - Add cart icon with item count badge
8. **Update ProductSection & ProductModal** - Add "Add to Cart" buttons
9. **Update App.tsx** - Add new routes for /cart and /payment-success

## Files to Create/Edit
- `app/frontend/src/lib/api.ts` - Fix dedup + add payment API functions
- `app/backend/routers/payments.py` - Payment endpoints
- `app/frontend/src/contexts/CartContext.tsx` - Cart state management
- `app/frontend/src/pages/Cart.tsx` - Cart page with checkout
- `app/frontend/src/pages/PaymentSuccess.tsx` - Payment success page
- `app/frontend/src/components/Header.tsx` - Add cart icon
- `app/frontend/src/components/ProductSection.tsx` - Add to cart button
- `app/frontend/src/components/ProductModal.tsx` - Add to cart button
- `app/frontend/src/App.tsx` - New routes