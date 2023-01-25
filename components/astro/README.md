[![banner](https://particles.js.org/images/banner3.png)](https://particles.js.org)

# @tsparticles/astro

[![npm](https://img.shields.io/npm/v/@tsparticles/astro)](https://www.npmjs.com/package/@tsparticles/astro) [![npm](https://img.shields.io/npm/dm/@tsparticles/astro)](https://www.npmjs.com/package/@tsparticles/astro) [![GitHub Sponsors](https://img.shields.io/github/sponsors/matteobruni)](https://github.com/sponsors/matteobruni)

Official [tsParticles](https://github.com/matteobruni/tsparticles) Astro component

[![Slack](https://particles.js.org/images/slack.png)](https://join.slack.com/t/tsparticles/shared_invite/enQtOTcxNTQxNjQ4NzkxLWE2MTZhZWExMWRmOWI5MTMxNjczOGE1Yjk0MjViYjdkYTUzODM3OTc5MGQ5MjFlODc4MzE0N2Q1OWQxZDc1YzI) [![Discord](https://particles.js.org/images/discord.png)](https://discord.gg/hACwv45Hme) [![Telegram](https://particles.js.org/images/telegram.png)](https://t.me/tsparticles)

[![tsParticles Product Hunt](https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=186113&theme=light)](https://www.producthunt.com/posts/tsparticles?utm_source=badge-featured&utm_medium=badge&utm_souce=badge-tsparticles") <a href="https://www.buymeacoffee.com/matteobruni"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a beer&emoji=🍺&slug=matteobruni&button_colour=5F7FFF&font_colour=ffffff&font_family=Arial&outline_colour=000000&coffee_colour=FFDD00"></a>

## Installation

```shell
npm install @tsparticles/astro
```

or

```shell
yarn add @tsparticles/astro
```

## How to use

```astro
---
import Particles from "@tsparticles/astro"
import type { ISourceOptions } from "@tsparticles/engine";

const options: ISourceOptions = {
    background: {
        color: "#000"
    },
    fullScreen: {
        zIndex: -1
    },
    particles: {
        move: {
            enable: true
        }
    }
};
---

<script>
    import { tsParticles } from "@tsparticles/engine";
    import { loadFull } from "tsparticles";

    (async () => {
        await loadFull(tsParticles);
    })();
</script>

<Particles id="tsparticles" options={options} />
```

### Props

| Prop            | Type     | Definition                                                                                                                                          |
|-----------------| -------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| id              | string   | The id of the element.                                                                                                                              |
| options         | object   | The options of the particles instance.                                                                                                              |
| url             | string   | The remote options url, called using an AJAX request                                                                                                |

#### particles.json

Find all configuration options [here](https://particles.js.org/docs/interfaces/Options_Interfaces_IOptions.IOptions.html).

You can find sample json configurations [here](https://github.com/matteobruni/tsparticles/tree/main/websites/particles.js.org/presets) 📖

## Demos

Preset demos can be found [here](https://particles.js.org/samples/presets/index.html)

There's also a CodePen collection actively maintained and updated [here](https://codepen.io/collection/DPOage)

Report bugs and issues [here](https://github.com/matteobruni/tsparticles/issues)

[tsParticle Website](https://particles.js.org)
