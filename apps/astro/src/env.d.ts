/// <reference types="astro/client" />

import type { Container, Engine } from "@tsparticles/engine";

// add the init function type to the global window object
declare global {
  interface Window {
    particlesInit: (engine: Engine) => Promise<void>;
    particlesLoaded: (container: Container) => void;
  }
}
