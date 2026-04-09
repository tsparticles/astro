# Astro Island Integration Pattern

## Overview

Astro uses **islands architecture** where client-side frameworks are loaded on-demand. The centralized engine pattern adapts to Astro's unique server/client split.

### Key Concepts
- **Server-side**: Engine initialization happens during build or SSR
- **Client-side**: Each island gets access without re-initialization
- **Hybrid**: Global window object or framework-specific providers
- **Zero JS**: Only hydrate components that need particles

## Setup

### Approach 1: Global Window Object (SSR-Safe)

```astro
---
// src/layouts/MainLayout.astro
import { loadFull } from "@tsparticles/presets";

interface Props {
  title: string;
}

const { title } = Astro.props;
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title}</title>
  </head>
  <body>
    <script>
      // Initialize before any island loads
      window.tsParticlesReady = (async () => {
        const { tsParticles } = await import("@tsparticles/engine");
        await (await import("@tsparticles/presets")).loadFull(tsParticles);
        return tsParticles;
      })();
    </script>
    <slot />
  </body>
</html>
```

### Approach 2: React Island with Provider

```astro
---
// src/pages/index.astro
import { ParticlesProvider } from "@tsparticles/react";
import ParticlesComponent from "../components/Particles.tsx";
import { loadFull } from "@tsparticles/presets";
---

<html>
  <head>
    <title>Home</title>
  </head>
  <body>
    <!-- This island hydrates with client:load -->
    <ParticlesProvider client:load particlesInit={loadFull}>
      <ParticlesComponent />
    </ParticlesProvider>
  </body>
</html>
```

**React Component** (`src/components/Particles.tsx`):
```tsx
import { Particles } from "@tsparticles/react";
import { useParticlesEngine } from "@tsparticles/react";

export default function ParticlesComponent() {
  const { engine, isReady } = useParticlesEngine();

  return (
    <div className="particles-container">
      {isReady && <Particles id="bg" options={{}} />}
    </div>
  );
}
```

### Approach 3: Vue Island

```astro
---
// src/components/ParticlesSection.astro
import { ParticlesPlugin } from "@tsparticles/vue";
import Particles from "../components/Particles.vue";
import { loadFull } from "@tsparticles/presets";
---

<section>
  <!-- Import Vue component as Astro component -->
  <Particles client:load />
</section>

<script setup>
  // This runs in the island context
  if (typeof window !== "undefined") {
    window.particlesInit = loadFull;
  }
</script>
```

## Usage Examples

### Particles Background (Global)

```astro
---
// src/layouts/WithParticles.astro
---

<html>
  <head>
    <title>Particles Background</title>
    <style>
      #particles-bg {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
      }
    </style>
  </head>
  <body>
    <div id="particles-bg"></div>
    <script>
      // Wait for particles ready, then load into fixed element
      window.tsParticlesReady = (async () => {
        const { tsParticles } = await import("@tsparticles/engine");
        await (await import("@tsparticles/presets")).loadFull(tsParticles);
        
        // Load into our fixed div
        await tsParticles.load({
          id: "particles-bg",
          options: {
            particles: { number: { value: 100 } },
            // ... config
          },
        });
        
        return tsParticles;
      })();
    </script>
    <slot />
  </body>
</html>
```

### Multiple Islands

```astro
---
// src/pages/about.astro
import ParticlesIsland from "../components/ParticlesIsland.tsx";
import { loadFull } from "@tsparticles/presets";

// Share init across all islands
const particlesInit = loadFull;
---

<html>
  <body>
    <!-- Island 1 -->
    <ParticlesIsland client:load init={particlesInit} id="hero" />

    <!-- Island 2 -->
    <ParticlesIsland client:load init={particlesInit} id="features" />

    <!-- Island 3 -->
    <ParticlesIsland client:load init={particlesInit} id="footer" />
  </body>
</html>
```

**Shared island** (`src/components/ParticlesIsland.tsx`):
```tsx
import { useEffect } from "react";
import { ParticlesProvider, useParticlesEngine } from "@tsparticles/react";
import { Particles } from "@tsparticles/react";

export default function ParticlesIsland({ init, id }: { init: any; id: string }) {
  return (
    <ParticlesProvider particlesInit={init}>
      <section id={id} className="particles-section">
        <ParticlesContent />
      </section>
    </ParticlesProvider>
  );
}

function ParticlesContent() {
  const { isReady } = useParticlesEngine();
  return isReady ? <Particles id="section" options={{}} /> : null;
}
```

## Best Practices for Astro

### 1. Initialize Early

```astro
---
// Put init in root layout
---
<html>
  <head>
    <script is:inline>
      // Block-scoped before any island loads
      globalThis.tsParticlesInit = (async () => {
        // ... init code
      })();
    </script>
  </head>
```

### 2. Use Appropriate Hydration

```astro
<!-- Only hydrate when needed -->
<ParticlesComponent client:load />

<!-- Or defer until interaction -->
<ParticlesComponent client:idle />

<!-- Or visible in viewport -->
<ParticlesComponent client:visible />
```

### 3. SSR-Safe Initialization

```tsx
// MyComponent.tsx
export default function MyComponent() {
  // This runs on server AND client
  useEffect(() => {
    // Only on client
    if (typeof window === "undefined") return;

    window.tsParticlesReady?.then(() => {
      // Do something with engine
    });
  }, []);

  return <div>Particles</div>;
}
```

## Performance Pattern

```astro
---
// Load just the minimal island upfront, rest deferred
import HeroParticles from "../components/HeroParticles.astro";
import FeatureParticles from "../components/FeatureParticles.astro";
---

<html>
  <body>
    <!-- Load immediately -->
    <HeroParticles client:load />

    <!-- Defer until visible -->
    <FeatureParticles client:visible />
  </body>
</html>
```

## API Type Support in Astro

```astro
---
import type { Engine } from "@tsparticles/engine";

// Safe typing even in .astro files
const config: { engine?: Engine } = {};
---
```

## Troubleshooting

### Islands not seeing shared engine

**Issue:** Each island initializes separately

**Fix:** Ensure global init runs before island hydration:
```astro
<script is:inline>
  // Must be before client:load islands
  globalThis.tsParticlesShared = initEngine();
</script>

<MyIsland client:load /> <!-- Now sees globalThis.tsParticlesShared -->
```

### Memory leaks with multiple islands

**Issue:** Each island caches independently

**Pattern:** Use service pattern for true singleton:
```ts
// lib/particlesService.ts
export const getOrInitEngine = async () => {
  if (!globalThis.tsParticlesEngine) {
    const { tsParticles } = await import("@tsparticles/engine");
    await loadFull(tsParticles);
    globalThis.tsParticlesEngine = tsParticles;
  }
  return globalThis.tsParticlesEngine;
};
```

Use from any island:
```tsx
export default function MyIsland() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    getOrInitEngine().then(() => setReady(true));
  }, []);

  return ready ? <Particles /> : null;
}
```
