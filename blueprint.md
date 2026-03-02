# Lotto Number Generator

## Project Overview
A simple, modern web application for generating lotto numbers (6 out of 45). The app features a clean UI, animated ball results, and support for both dark and light modes.

## Current Features
- **Lotto Generation:** Generates 6 unique random numbers between 1 and 45.
- **Animated Results:** Numbers appear one by one with a "pop-in" animation.
- **Web Components:** Uses a custom `<lotto-ball>` element for number display.
- **Dark/Light Mode:** Full support for theme switching with persistence using `localStorage`.
- **Responsive Design:** Works on all screen sizes with a centered layout and mobile-friendly UI.
- **Modern CSS:** Uses CSS variables, transitions, and flexbox for a polished look.

## Design Details
- **Typography:** Poppins (Google Fonts).
- **Colors (Dark):** Deep grays (#1a1a1a) with vibrant yellow (#ffde00) accents.
- **Colors (Light):** Soft gray (#f0f2f5) with orange (#e67e22) accents.
- **Visual Effects:** Soft deep shadows, smooth transitions between themes, and interactive hover effects on buttons.

## Implementation Steps (Latest Update)
1. **Fixed ID Inconsistencies:** Aligned IDs between HTML, CSS, and JS (`generate-btn`, `lotto-numbers`).
2. **Added Theme Toggle:**
   - Implemented a floating toggle button.
   - Added CSS variables for both themes.
   - Added JS logic to switch classes and save state to `localStorage`.
3. **Enhanced UI:**
   - Improved the container layout.
   - Refined the lotto ball animations.
   - Added system theme detection as a fallback.
4. **Git Integration:** Pushed final changes to the main branch.
