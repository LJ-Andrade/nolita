# UI/UX Standards for Authentication Pages

This document defines the standardized design for all authentication-related pages in the administrative panel (Login, Forgot Password, Reset Password, etc.).

## 1. Page Layout & Background

Auth pages must use the **Deep Space** aesthetic to ensure a premium and immersive experience.

### Container Structure
- **Wrapper**: `min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-black`.
- **Background Layer**: A dedicated absolute container with the following gradients:
  - **Linear Gradient**: `linear-gradient(to bottom, #000000 0%, #0a0010 20%, #150020 40%, #1a0a2e 55%, #2d1040 70%, #3d1045 85%, #1a0a15 100%)`.
  - **Radial hotspot (Magenta)**: `radial-gradient(ellipse 70% 50% at 50% 100%, rgba(255, 0, 128, 0.7) 0%, rgba(200, 0, 100, 0.5) 15%, rgba(150, 0, 80, 0.35) 30%, rgba(80, 0, 60, 0.2) 50%, transparent 70%)`.
  - **Radial hotspot (Orange/Red)**: `radial-gradient(ellipse 40% 45% at 70% 95%, rgba(200, 60, 20, 0.5) 0%, rgba(160, 40, 10, 0.3) 25%, rgba(100, 20, 5, 0.15) 50%, transparent 70%)`.
  - **Radial hotspot (Warm)**: `radial-gradient(ellipse 35% 40% at 25% 98%, rgba(200, 100, 20, 0.3) 0%, rgba(150, 50, 10, 0.15) 30%, transparent 60%)`.
  - **Component**: Must include `<DeepSpaceBackground />` at the top level of the background layers.

## 2. Card Design

The central card must follow these strict styling rules:

### Classes
- `bg-slate-900/92`: Semi-transparent deep slate background.
- `backdrop-blur-xl`: High intensity blur for glassmorphism.
- `border-none`: No visible borders.
- `shadow-2xl`: Large drop shadow.

### Inline Styles (Critical)
Must include a custom `boxShadow` to add depth and a subtle inner highlight:
```jsx
style={{ 
  boxShadow: '0 8px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.08)' 
}}
```

## 3. Typography & Branding

- **Main Title**: Use `text-5xl font-bold text-center mb-8 tracking-tight`.
- **Gradient Text**: Apply `bg-linear-to-r from-cyan-400 via-teal-400 to-blue-500 bg-clip-text text-transparent` to the brand name (e.g., **VADMIN**).
- **Form Labels**: Use `text-sm font-medium text-slate-300`.
- **Inputs**: Use `h-11 bg-slate-800/50 border-none focus:ring-2 focus:ring-cyan-500/20 text-slate-100 placeholder:text-slate-500 transition-all`.

## 4. Reference Implementation

- ✅ **Login**: `src/views/Login.jsx`
- ✅ **Forgot Password**: `src/views/ForgotPassword.jsx`
- ✅ **Reset Password**: `src/views/ResetPassword.jsx`
