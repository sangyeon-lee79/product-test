
# Lotto Number Generator

## Overview

A simple, visually appealing web application to generate random lottery numbers. The application will feature a clean interface, smooth animations, and a responsive design that works on both desktop and mobile devices.

## Project Outline

### **Design and Style**

*   **Layout:** A centered, card-based layout.
*   **Color Palette:** A modern and energetic color scheme with gradients.
*   **Typography:** Clear and readable fonts.
*   **Effects:**
    *   Subtle background texture.
    *   Soft, deep drop shadows on cards to create a "lifted" look.
    *   "Glow" effect on interactive elements like the button.
    *   Animations for the number generation.
*   **Iconography:** Use of icons to enhance user understanding.

### **Features**

*   **Number Generation:** Generate 6 unique random numbers between 1 and 45.
*   **Display:** Display the generated numbers in a clear and visually appealing way.
*   **Interactivity:** A button to trigger the number generation.
*   **Web Component:** A custom element `<lotto-ball>` will be used to display each number, encapsulating its style and behavior.

## Current Plan

1.  **Create `blueprint.md`:** Document the project plan.
2.  **Modify `index.html`:** Set up the basic structure of the application, including the main container, a title, a button, and a placeholder for the lottery numbers.
3.  **Modify `style.css`:** Implement the visual design using modern CSS, including layout, colors, fonts, and effects.
4.  **Modify `main.js`:**
    *   Implement the lottery number generation logic.
    *   Create the `<lotto-ball>` Web Component to display the numbers.
    *   Add an event listener to the button to trigger the generation and display of the numbers.
