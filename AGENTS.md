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

## Dark Mode Architecture Rules

These rules are mandatory for future UI work so the app can support a professional Light and Dark Mode without large later refactors.

### 1. Theme Architecture

- Do not spread hardcoded colors directly across screen files.
- Manage colors centrally whenever practical, for example in `constants/theme.ts` or `constants/colors.ts`.
- New components must be structured so they can become theme-aware later.
- Prefer named semantic color tokens over raw color values in UI code.

### 2. Dark Mode Strategy

- Do not fully activate Dark Mode unless explicitly requested.
- New UI components should still be structured to be Dark-Mode-compatible.
- `useColorScheme` may be prepared or used when it is helpful and does not overcomplicate the task.
- Do not add a manual theme toggle unless explicitly requested.

### 3. Color Rules

- Avoid using pure black or pure white surfaces everywhere.
- Prefer comfortable contrast rather than harsh contrast.
- Avoid pure `#000000` where a slightly lifted dark surface works better.
- Keep dark surfaces slightly elevated and readable.
- Prioritize text readability in every color decision.

### 4. Accessibility

- Text must remain readable in both Light and Dark Mode.
- Keep contrast accessibility-friendly.
- Do not communicate meaning through color alone.
- Status, emphasis, and validation states must also have text, icons, structure, or labels when needed.

### 5. Component Rules

- Reusable components should consume theme values instead of local raw colors.
- Avoid scattered inline color values across many files.
- Import colors from a central theme source whenever the task scope allows it.
- Keep component APIs compatible with future theme changes.

### 6. UI Behavior

- Status colors for success, warning, error, and info must work in both Light and Dark Mode.
- Buttons, inputs, cards, and lists must stay clearly distinguishable in both modes.
- Disabled, pressed, focused, and error states must remain visible in both modes.

### 7. Development Rule

- For larger UI changes, check whether hardcoded colors can be avoided.
- For larger UI changes, check whether the structure remains Dark-Mode-ready.
- Do not perform large theme refactors unless explicitly requested.
- Keep theme improvements scoped to the current task unless the user asks for a broader redesign.
