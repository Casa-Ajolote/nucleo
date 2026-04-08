# Motion Design

## The Animation Decision Framework

Before writing any animation code, answer these questions in order:

### 1. Should this animate at all?

How often will users see this animation?

| Frequency | Decision |
|-----------|----------|
| **100+ times/day** (keyboard shortcuts, command palette) | No animation. Ever. |
| **Tens of times/day** (hover effects, list navigation) | Remove or drastically reduce |
| **Occasional** (modals, drawers, toasts) | Standard animation |
| **Rare/first-time** (onboarding, celebrations) | Can add delight |

**Never animate keyboard-initiated actions.** They are repeated hundreds of times daily. Animation makes them feel slow.

### 2. What is the purpose?

Every animation must have a clear answer to "why does this animate?"

Valid purposes:
- **Spatial consistency**: toast enters/exits from the same direction
- **State indication**: a morphing button shows state change
- **Feedback**: button scales down on press, confirming the input
- **Preventing jarring changes**: elements appearing/disappearing without transition feel broken

If the purpose is just "it looks cool" and the user will see it often, don't animate.

### 3. What easing should it use?

See "Easing: Pick the Right Curve" below.

### 4. How fast should it be?

See "Duration" below.

---

## Duration: The 100/300/500 Rule

Timing matters more than easing. These durations feel right for most UI:

| Duration | Use Case | Examples |
|----------|----------|----------|
| **100-150ms** | Instant feedback | Button press, toggle, color change |
| **200-300ms** | State changes | Menu open, tooltip, hover states |
| **300-500ms** | Layout changes | Accordion, modal, drawer |
| **500-800ms** | Entrance animations | Page load, hero reveals |

**Exit animations are faster than entrances**—use ~75% of enter duration.

**Asymmetric enter/exit timing**: Pressing should be slow when deliberate (hold-to-delete: 2s linear), but release should always be snappy (200ms ease-out). Slow where the user is deciding, fast where the system is responding.

**Rule: UI animations should stay under 300ms.** A 180ms dropdown feels more responsive than a 400ms one.

## Easing: Pick the Right Curve

**Don't use `ease`.** It's a compromise that's rarely optimal. Instead:

| Curve | Use For | CSS |
|-------|---------|-----|
| **ease-out** | Elements entering | `cubic-bezier(0.16, 1, 0.3, 1)` |
| **ease-in** | Elements leaving | `cubic-bezier(0.7, 0, 0.84, 0)` |
| **ease-in-out** | State toggles (there → back) | `cubic-bezier(0.65, 0, 0.35, 1)` |
| **linear** | Constant motion (marquee, progress bar) | `linear` |

**For micro-interactions, use exponential curves**—they feel natural because they mimic real physics (friction, deceleration):

```css
/* Quart out - smooth, refined (recommended default) */
--ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);

/* Quint out - slightly more dramatic */
--ease-out-quint: cubic-bezier(0.22, 1, 0.36, 1);

/* Expo out - snappy, confident */
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);

/* Strong ease-out for UI interactions (Emil Kowalski) */
--ease-out-strong: cubic-bezier(0.23, 1, 0.32, 1);

/* iOS-like drawer curve (Ionic Framework) */
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

**Critical: use custom easing curves.** The built-in CSS easings are too weak. They lack the punch that makes animations feel intentional. Use [easing.dev](https://easing.dev/) or [easings.co](https://easings.co/) to find stronger custom variants.

**Never use ease-in for UI entry animations.** It starts slow, which makes the interface feel sluggish. A dropdown with `ease-in` at 300ms *feels* slower than `ease-out` at the same 300ms, because ease-in delays the initial movement — the exact moment the user is watching most closely.

**Avoid bounce and elastic curves.** They were trendy in 2015 but now feel tacky and amateurish. Real objects don't bounce when they stop—they decelerate smoothly. Overshoot effects draw attention to the animation itself rather than the content.

## The Only Two Properties You Should Animate

**transform** and **opacity** only—everything else causes layout recalculation. For height animations (accordions), use `grid-template-rows: 0fr → 1fr` instead of animating `height` directly.

## CSS Transitions vs Keyframes

**Use CSS transitions for interruptible UI.** Transitions can be interrupted and retargeted mid-animation. Keyframes restart from zero. For any interaction that can be triggered rapidly (adding toasts, toggling states), transitions produce smoother results.

```css
/* Interruptible - good for dynamic UI */
.toast {
  transition: transform 400ms ease;
}

/* Not interruptible - avoid for dynamic UI */
@keyframes slideIn {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
```

**Use keyframes for**: predetermined, non-interactive animations (loading spinners, marketing reveals).

## Entry Animations with @starting-style

Modern CSS way to animate element entry without JavaScript:

```css
.toast {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 400ms ease, transform 400ms ease;

  @starting-style {
    opacity: 0;
    transform: translateY(100%);
  }
}
```

This replaces the common React pattern of `useEffect` to set `mounted: true` after initial render. Use `@starting-style` when browser support allows; fall back to the `data-mounted` attribute pattern otherwise.

## Spring Animations

Springs feel more natural than duration-based animations because they simulate real physics. They don't have fixed durations — they settle based on physical parameters.

### When to use springs

- Drag interactions with momentum
- Elements that should feel "alive" (like Apple's Dynamic Island)
- Gestures that can be interrupted mid-animation
- Decorative mouse-tracking interactions

### Spring-based mouse interactions

Tying visual changes directly to mouse position feels artificial. Use `useSpring` from Motion to interpolate with spring behavior:

```jsx
import { useSpring } from 'framer-motion';

// Without spring: feels artificial, instant
const rotation = mouseX * 0.1;

// With spring: feels natural, has momentum
const springRotation = useSpring(mouseX * 0.1, {
  stiffness: 100,
  damping: 10,
});
```

This works because the animation is **decorative**. If it were a functional graph in a banking app, no animation would be better.

### Spring configuration

**Apple's approach (recommended — easier to reason about):**
```js
{ type: "spring", duration: 0.5, bounce: 0.2 }
```

**Traditional physics (more control):**
```js
{ type: "spring", mass: 1, stiffness: 100, damping: 10 }
```

Keep bounce subtle (0.1-0.3). Avoid bounce in most UI contexts. Use it for drag-to-dismiss and playful interactions.

### Interruptibility advantage

Springs maintain velocity when interrupted — CSS animations and keyframes restart from zero. This makes springs ideal for gestures users might change mid-motion.

## Component Animation Patterns

### Buttons must feel responsive

Add `transform: scale(0.97)` on `:active`. This gives instant feedback.

```css
.button {
  transition: transform 160ms ease-out;
}
.button:active {
  transform: scale(0.97);
}
```

The scale should be subtle (0.95-0.98).

### Never animate from scale(0)

Nothing in the real world disappears and reappears completely. Start from `scale(0.95)` or higher, combined with opacity:

```css
/* Bad */
.entering { transform: scale(0); }

/* Good */
.entering { transform: scale(0.95); opacity: 0; }
```

### Make popovers origin-aware

Popovers should scale in from their trigger, not from center. **Exception: modals** — they keep `transform-origin: center` because they're not anchored to a specific trigger.

```css
/* Radix UI */
.popover { transform-origin: var(--radix-popover-content-transform-origin); }

/* Base UI */
.popover { transform-origin: var(--transform-origin); }
```

### Tooltips: skip delay on subsequent hovers

Once one tooltip is open, hovering over adjacent tooltips should open instantly with no animation:

```css
.tooltip {
  transition: transform 125ms ease-out, opacity 125ms ease-out;
  transform-origin: var(--transform-origin);
}
.tooltip[data-starting-style],
.tooltip[data-ending-style] {
  opacity: 0;
  transform: scale(0.97);
}
/* Skip animation on subsequent tooltips */
.tooltip[data-instant] {
  transition-duration: 0ms;
}
```

### Use blur to mask imperfect transitions

When a crossfade between two states feels off, add subtle `filter: blur(2px)` during the transition. Without blur, you see two distinct objects overlapping. Blur bridges the visual gap. Keep blur under 20px (heavy blur is expensive, especially in Safari).

## Staggered Animations

Use CSS custom properties for cleaner stagger: `animation-delay: calc(var(--i, 0) * 50ms)` with `style="--i: 0"` on each item. **Cap total stagger time**—10 items at 50ms = 500ms total. For many items, reduce per-item delay or cap staggered count.

Keep stagger delays short (30-80ms between items). Long delays make the interface feel slow. Stagger is decorative — never block interaction while stagger animations are playing.

## clip-path for Animation

`clip-path` is not just for shapes — it's one of the most powerful animation tools in CSS.

### The inset shape

`clip-path: inset(top right bottom left)` defines a rectangular clipping region. Each value "eats" into the element from that side.

```css
/* Hidden from right */
.hidden { clip-path: inset(0 100% 0 0); }

/* Fully visible */
.visible { clip-path: inset(0 0 0 0); }

/* Reveal from left to right */
.overlay {
  clip-path: inset(0 100% 0 0);
  transition: clip-path 200ms ease-out;
}
.button:active .overlay {
  clip-path: inset(0 0 0 0);
  transition: clip-path 2s linear;
}
```

### Use cases

- **Tabs with color transitions**: Duplicate tab list, style copy as "active", clip so only active tab is visible, animate clip on tab change
- **Hold-to-delete**: `clip-path: inset(0 100% 0 0)` overlay, on `:active` transition to `inset(0 0 0 0)` over 2s linear, release snaps back at 200ms ease-out
- **Image reveals on scroll**: Start with `clip-path: inset(0 0 100% 0)`, animate to `inset(0 0 0 0)` when element enters viewport via `IntersectionObserver`
- **Comparison sliders**: Overlay two images, clip top one with `inset(0 50% 0 0)`, adjust based on drag position

## Gesture and Drag Interactions

### Momentum-based dismissal

Don't require dragging past a threshold. Calculate velocity: `Math.abs(dragDistance) / elapsedTime`. If velocity exceeds ~0.11, dismiss regardless of distance. A quick flick should be enough.

```js
const timeTaken = new Date().getTime() - dragStartTime.current.getTime();
const velocity = Math.abs(swipeAmount) / timeTaken;

if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
  dismiss();
}
```

### Damping at boundaries

When a user drags past the natural boundary (e.g., dragging a drawer up when already at top), apply damping. The more they drag, the less the element moves. Real things don't suddenly stop — they slow down.

### Pointer capture for drag

Once dragging starts, capture all pointer events on the element. This ensures dragging continues even if the pointer leaves the element bounds.

### Multi-touch protection

Ignore additional touch points after the initial drag begins. Without this, switching fingers mid-drag causes the element to jump.

### Friction instead of hard stops

Allow dragging past boundaries with increasing friction. It feels more natural than hitting an invisible wall.

## Reduced Motion

This is not optional. Vestibular disorders affect ~35% of adults over 40.

```css
/* Define animations normally */
.card { animation: slide-up 500ms ease-out; }

/* Provide alternative for reduced motion */
@media (prefers-reduced-motion: reduce) {
  .card { animation: fade-in 200ms ease-out; }
}
```

**What to preserve**: Opacity and color transitions that aid comprehension. Remove movement and position animations.

```jsx
const shouldReduceMotion = useReducedMotion();
const closedX = shouldReduceMotion ? 0 : '-100%';
```

### Touch device hover states

```css
@media (hover: hover) and (pointer: fine) {
  .element:hover { transform: scale(1.05); }
}
```

Touch devices trigger hover on tap, causing false positives. Gate hover animations behind this media query.

## Perceived Performance

**Nobody cares how fast your site is—just how fast it feels.**

**The 80ms threshold**: Our brains buffer sensory input for ~80ms. Anything under 80ms feels instant. This is your target for micro-interactions.

**Speed perception tricks**:
- A fast-spinning spinner makes loading feel faster (same load time, different perception)
- A 180ms select animation feels more responsive than 400ms
- Instant tooltips after the first one make the whole toolbar feel faster
- `ease-out` at 200ms *feels* faster than `ease-in` at 200ms because the user sees immediate movement

**Active vs passive time**: Passive waiting (staring at a spinner) feels longer than active engagement:
- **Preemptive start**: Begin transitions immediately while loading (skeleton UI)
- **Early completion**: Show content progressively—don't wait for everything
- **Optimistic UI**: Update the interface immediately, handle failures gracefully. Use for low-stakes actions; avoid for payments

**Caution**: Too-fast responses can decrease perceived value. Sometimes a brief delay signals "real work" is happening.

## Performance

### CSS vs JS animations

**CSS animations run off the main thread.** When the browser is busy loading a page, Framer Motion animations (using `requestAnimationFrame`) drop frames. CSS animations remain smooth. Use CSS for predetermined animations; JS for dynamic, interruptible ones.

### Framer Motion hardware acceleration caveat

Framer Motion's shorthand properties (`x`, `y`, `scale`) are NOT hardware-accelerated. They use `requestAnimationFrame` on the main thread. For hardware acceleration, use the full `transform` string:

```jsx
// NOT hardware accelerated
<motion.div animate={{ x: 100 }} />

// Hardware accelerated
<motion.div animate={{ transform: "translateX(100px)" }} />
```

### Web Animations API (WAAPI)

JavaScript control with CSS performance. Hardware-accelerated, interruptible, no library needed:

```js
element.animate(
  [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0 0)' }],
  { duration: 1000, fill: 'forwards', easing: 'cubic-bezier(0.77, 0, 0.175, 1)' }
);
```

### CSS variables caveat

Changing a CSS variable on a parent recalculates styles for all children. In a drawer with many items, updating `--swipe-amount` on the container causes expensive recalculation. Update `transform` directly on the element instead:

```js
// Bad: triggers recalc on all children
element.style.setProperty('--swipe-amount', `${distance}px`);

// Good: only affects this element
element.style.transform = `translateY(${distance}px)`;
```

### General rules

Don't use `will-change` preemptively—only when animation is imminent (`:hover`, `.animating`). For scroll-triggered animations, use Intersection Observer instead of scroll events; unobserve after animating once. Create motion tokens for consistency.

## Debugging Animations

### Slow motion testing

Temporarily increase duration to 2-5x normal, or use browser DevTools animation inspector. Things to look for:
- Do colors transition smoothly, or do you see two distinct states overlapping?
- Does the easing feel right, or does it start/stop abruptly?
- Is the transform-origin correct?
- Are multiple animated properties (opacity, transform, color) in sync?

### Frame-by-frame inspection

Step through animations frame by frame in Chrome DevTools (Animations panel). This reveals timing issues between coordinated properties invisible at full speed.

### Test on real devices

For touch interactions (drawers, swipe gestures), test on physical devices. The Xcode Simulator is an alternative but real hardware is better for gesture testing.

### Review with fresh eyes

Review animations the next day. You notice imperfections with fresh eyes that you missed during development.

---

## Animation Review Checklist

When reviewing motion/animation code, use this table format:

| Before | After | Why |
|--------|-------|-----|
| `transition: all 300ms` | `transition: transform 200ms ease-out` | Specify exact properties; avoid `all` |
| `transform: scale(0)` | `transform: scale(0.95); opacity: 0` | Nothing appears from nothing |
| `ease-in` on dropdown | `ease-out` with custom curve | `ease-in` feels sluggish on entry |
| No `:active` state on button | `transform: scale(0.97)` on `:active` | Buttons must feel responsive |
| `transform-origin: center` on popover | `transform-origin: var(--radix-popover-content-transform-origin)` | Scale from trigger (modals exempt) |
| Animation on keyboard action | Remove animation | Too frequent, feels slow |
| Duration > 300ms on UI element | Reduce to 150-250ms | UI must feel snappy |
| Hover without media query | `@media (hover: hover) and (pointer: fine)` | Prevents false positives on touch |
| Keyframes on rapidly-triggered element | CSS transitions | Interruptibility needed |
| Framer Motion `x`/`y` props | `transform: "translateX()"` | Hardware acceleration |
| Same enter/exit speed | Exit faster than enter | System responds, user decides |
| All elements appear at once | Stagger 30-80ms between items | Cascading feels natural |

---

**Avoid**: Animating everything (animation fatigue is real). Using >500ms for UI feedback. Ignoring `prefers-reduced-motion`. Using animation to hide slow loading.

> *Partially based on [Emil Kowalski's](https://emilkowal.ski/skill) design engineering principles.*
