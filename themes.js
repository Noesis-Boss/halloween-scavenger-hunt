/**
 * Scavenger Hunt Themes Schema and Presets
 */
export const THEMES = {
  halloween: {
    id: 'halloween',
    name: 'Halloween SpookHunt',
    tagline: 'CURSED PURSUIT',
    itemTerm: { singular: 'Relic', plural: 'Relics', actionVerb: 'Banished' },
    mascot: '🎃',
    palette: {
      bg: '#07030d',
      card: '#160b28',
      primary: '#ff5500',
      secondary: '#9333ea',
      accent: '#10b981'
    },
    defaultSquads: [
      { id: 't-phantoms', name: 'The Phantoms', icon: '👻' },
      { id: 't-pumpkin', name: 'Pumpkin Kings', icon: '🎃' },
      { id: 't-witches', name: 'Witching Hour', icon: '🧙‍♀️' },
      { id: 't-shadows', name: 'Shadow Stalkers', icon: '🦇' }
    ]
  },
  birthday: {
    id: 'birthday',
    name: 'Birthday Quest',
    tagline: 'PARTY PURSUIT',
    itemTerm: { singular: 'Present', plural: 'Presents', actionVerb: 'Unwrapped' },
    mascot: '🎂',
    palette: {
      bg: '#090d16',
      card: '#111827',
      primary: '#ec4899',
      secondary: '#6366f1',
      accent: '#10b981'
    },
    defaultSquads: [
      { id: 't-cake', name: 'Cake Crushers', icon: '🎂' },
      { id: 't-balloon', name: 'Balloon Brigade', icon: '🎈' },
      { id: 't-animals', name: 'Party Animals', icon: '🦁' },
      { id: 't-confetti', name: 'Confetti Crew', icon: '🎉' }
    ]
  },
  christmas: {
    id: 'christmas',
    name: 'Holiday Hunt',
    tagline: 'WINTER PURSUIT',
    itemTerm: { singular: 'Ornament', plural: 'Ornaments', actionVerb: 'Discovered' },
    mascot: '🎄',
    palette: {
      bg: '#051b11',
      card: '#0a2e1d',
      primary: '#ef4444',
      secondary: '#15803d',
      accent: '#eab308'
    },
    defaultSquads: [
      { id: 't-sleigh', name: 'Sleigh Riders', icon: '🛷' },
      { id: 't-elves', name: 'Mischief Elves', icon: '🧝' },
      { id: 't-snow', name: 'Snowball Strikers', icon: '⛄' },
      { id: 't-candy', name: 'Candy Canes', icon: '🍬' }
    ]
  },
  pirate: {
    id: 'pirate',
    name: 'Pirate Treasure Hunt',
    tagline: 'DOUBLOON PURSUIT',
    itemTerm: { singular: 'Treasure', plural: 'Treasures', actionVerb: 'Plundered' },
    mascot: '🏴‍☠️',
    palette: {
      bg: '#05131a',
      card: '#0c222e',
      primary: '#f59e0b',
      secondary: '#dc2626',
      accent: '#06b6d4'
    },
    defaultSquads: [
      { id: 't-pearl', name: 'Black Pearl', icon: '🏴‍☠️' },
      { id: 't-scoundrels', name: 'Sea Scoundrels', icon: '🦜' },
      { id: 't-kraken', name: 'Kraken Hunters', icon: '🐙' },
      { id: 't-doubloons', name: 'Gold Doubloons', icon: '🪙' }
    ]
  }
};
