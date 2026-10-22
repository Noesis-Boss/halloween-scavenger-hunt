# Scavenger Hunt Multi-Theme Architecture Specification

## 1. Theme Data Schema

Each theme encapsulates visual styling, terminology, sound synthesis parameters, and starter clue/squad presets:

```typescript
interface ScavengerTheme {
  id: string;                    // Unique slug: 'halloween' | 'birthday' | 'christmas' | 'pirate'
  name: string;                  // Display name: 'Halloween Coven' | 'Birthday Bash'
  tagline: string;               // e.g., 'Cursed Pursuit' | 'Party Quest'
  itemTerm: {                    // Plural & singular item labels
    singular: string;            // 'Relic' | 'Present' | 'Treasure'
    plural: string;              // 'Relics' | 'Presents' | 'Treasures'
    actionVerb: string;          // 'Banished' | 'Unwrapped' | 'Discovered'
  };
  palette: {
    bgBase: string;              // App background hex
    cardBg: string;              // Surface glass background
    primary: string;             // Accent color (buttons, highlights)
    secondary: string;           // Secondary glow
    success: string;             // Solved check marks
    danger: string;              // Alerts & warnings
  };
  mascotIcons: {
    app: string;                 // e.g., '🎃' | '🎂' | '🎄' | '🏴‍☠️'
    clueDefault: string;         // '💀' | '🎁' | '⭐' | '🪙'
    victory: string[];           // ['🎃', '🏆', '👻'] | ['🎉', '🎂', '🥳']
  };
  audioTones: {
    chime: number[];             // Scale frequencies for solve chime (e.g. [659, 784, 1046])
    victory: number[];           // Celebration chords
    alert: number[];             // Siren frequencies
  };
  starterSquads: Array<{
    id: string;
    name: string;
    icon: string;
  }>;
  starterClues: Array<{
    id: string;
    title: string;
    location: string;
    icon: string;
    riddle: string;
    secretCode: string;
    points: number;
    hint: string;
  }>;
}
```

---

## 2. Supported Theme Presets

### A. Halloween (`halloween`) — *Current Active*
- **Terms:** Relics / Banished
- **Palette:** Obsidian Night (`#07030d`), Pumpkin Orange (`#ff5500`), Witch Purple (`#9333ea`), Slime Green (`#10b981`)
- **Squads:** The Phantoms 👻, Pumpkin Kings 🎃, Witching Hour 🧙‍♀️, Shadow Stalkers 🦇

### B. Birthday Party (`birthday`)
- **Terms:** Presents / Unwrapped
- **Palette:** Confetti Blue (`#0f172a`), Electric Pink (`#ec4899`), Birthday Gold (`#f59e0b`), Mint (`#10b981`)
- **Audio:** Major pentatonic celebration chime + party horn fanfare
- **Squads:** Cake Crushers 🎂, Balloon Brigade 🎈, Party Animals 🦁, Confetti Crew 🎉
- **Sample Clues:**
  1. *The Frosting Fort:* "Where sweet cream chills behind cold white doors." (Location: Refrigerator / Kitchen)
  2. *The Gift Mountain:* "Stacked high with ribbons and bright bows." (Location: Gift Table)

### C. Christmas / Winter Holiday (`christmas`)
- **Terms:** Ornaments / Found
- **Palette:** Pine Green (`#062316`), Crimson Velvet (`#b91c1c`), Gold Bell (`#eab308`), Snow (`#f8fafc`)
- **Audio:** Bell chime intervals (Tubular bells synthesis)
- **Squads:** Sleigh Riders 🛷, Mischief Elves 🧝, Snowball Strikers ⛄, Candy Canes 🍬
- **Sample Clues:**
  1. *The Evergreen Crown:* "Star upon my head, tinsel 'round my bough." (Location: Tree)
  2. *The Warm Hearth:* "Where stockings hang waiting for midnight footsteps." (Location: Fireplace)

### D. Pirate Treasure Hunt (`pirate`)
- **Terms:** Treasures / Plundered
- **Palette:** Deep Ocean (`#081c24`), Doubloon Gold (`#eab308`), Treasure Crimson (`#991b1b`)
- **Audio:** Low brass fifths / triumphant brass blast
- **Squads:** Black Pearl 🏴‍☠️, Sea Scoundrels 🦜, Kraken Hunters 🐙, Gold Doubloons 🪙
- **Sample Clues:**
  1. *The Captain's Quarters:* "Where sea charts roll and the compass spins true." (Location: Study Desk)
  2. *Davy Jones' Locker:* "Deep beneath murky green waters." (Location: Pool / Pond)

---

## 3. Implementation Mechanism (Minimum Diff)

1. **`themes.json` / module:** Store presets as JSON dictionary keyed by `id`.
2. **CSS Custom Properties on `:root`:**
   ```css
   :root {
     --theme-bg: #07030d;
     --theme-primary: #ff5500;
     --theme-secondary: #9333ea;
   }
   ```
3. **Admin Dropdown:**
   - In Admin Sanctum (`1881`), a single `<select id="themeSelector" onchange="switchHuntTheme(this.value)">`.
   - Switching theme writes `{ themeId: 'birthday' }` to `/api/state` + `localStorage` and applies the tokens dynamically.
