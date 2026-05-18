# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v54.0.0/ before writing any code.

## Mobile UX, UI, and App Design Rules

These rules are mandatory for all future UI and UX decisions in this project.

### 1. Mobile-First Design

- The app is primarily developed for Android smartphones.
- Layouts must be optimized for mobile use first.
- Do not apply desktop-first assumptions to mobile screens.
- Content must remain usable and readable on small displays.

### 2. Thumb Zone and Reachability

- Place primary actions near the lower part of the screen whenever possible.
- Do not place important buttons only in hard-to-reach top corners.
- Prefer bottom actions for primary mobile workflows.
- Always account for Android system navigation, safe areas, and device insets.

### 3. Touch Targets

- Buttons and tappable elements must be large enough for touch input.
- Use touch targets of about 44x44 or 48x48 points/pixels where practical.
- Keep enough spacing between interactive elements.
- Small icons must have an additional tappable area around them.

### 4. Progressive Disclosure

- Hide optional content by default.
- Show advanced or secondary content only after the user actively opens it.
- Examples include optional notes, additional options, and rarely used settings.
- Do not overload screens with content that is not immediately needed.

### 5. Forms

- Keep mobile forms short, simple, and fast to complete.
- Use single-column form layouts.
- Provide clear spacing between fields.
- Clearly indicate required fields.
- Use appropriate keyboard types when useful.
- Forms should support quick mobile input and avoid unnecessary friction.

### 6. Lists and Scrollability

- Long content must remain scrollable.
- Do not break expected scroll behavior.
- Lists must stay clear, readable, and reasonably performant.
- Fixed footers and system bars must never cover important list content.

### 7. Visual Hierarchy

- Clearly emphasize important content and actions.
- Use whitespace and spacing generously.
- Avoid overloaded screens.
- Users must be able to immediately identify the primary action, current information, and next steps.

### 8. Accessibility

- Use strong enough contrast for text and controls.
- Keep text readable and avoid extremely small text sizes.
- Do not communicate meaning by color alone.
- Keep UI patterns broadly accessibility-friendly.

### 9. UX Rules

- Keep user flows as short as possible.
- Avoid repeated unnecessary steps.
- Allow multiple entries in one flow when that is useful.
- Do not force users through many separate screens without a good reason.
- Mobile use should feel fast, direct, and fluid.

### 10. Gestures and Hidden Interactions

- Critical functions must never be available only through gestures.
- Important actions must always have visible UI.
- Gestures may be used only as an optional enhancement.

### 11. Layout Rules

- Always consider SafeAreaView, safe-area-context insets, and mobile device insets.
- Footer buttons must never be clipped or covered.
- Prefer large bottom action areas for primary actions.
- Design layouts with smaller Android devices in mind.

### 12. UI Architecture

- Keep UI components reusable where practical.
- Prefer small, clearly separated components.
- Do not build huge screen files when a screen can be reasonably split into focused components.
