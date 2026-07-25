export type PhaseType = 'inhale' | 'hold-full' | 'exhale' | 'hold-empty';

export interface Phase {
  type: PhaseType;
  durationSeconds: number;
  cue: string;
}

export interface Pattern {
  id: string;
  name: string;
  description: string;
  benefit: string;
  phases: Phase[];
}

export interface Mood {
  id: string;
  label: string;
}

export const PATTERNS: Pattern[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    description: 'Equal counts on every step: in, hold, out, hold.',
    benefit: 'Sharpens focus and steadies your nerves. Used by first responders to stay calm under pressure.',
    phases: [
      { type: 'inhale', durationSeconds: 4, cue: 'Breathe in' },
      { type: 'hold-full', durationSeconds: 4, cue: 'Hold' },
      { type: 'exhale', durationSeconds: 4, cue: 'Breathe out' },
      { type: 'hold-empty', durationSeconds: 4, cue: 'Hold' },
    ],
  },
  {
    id: '4-7-8',
    name: '4-7-8 Breathing',
    description: 'Inhale 4, hold 7, exhale 8. The long exhale is the key.',
    benefit: 'Eases anxiety and quiets a racing mind. Great before sleep or during a panic spike.',
    phases: [
      { type: 'inhale', durationSeconds: 4, cue: 'Breathe in' },
      { type: 'hold-full', durationSeconds: 7, cue: 'Hold' },
      { type: 'exhale', durationSeconds: 8, cue: 'Breathe out' },
    ],
  },
  {
    id: 'calm',
    name: 'Calm Breathing',
    description: 'Slow inhale, longer exhale. No holding, just flow.',
    benefit: 'Gently brings your heart rate down when you feel overwhelmed. The most relaxing of the three.',
    phases: [
      { type: 'inhale', durationSeconds: 4, cue: 'Breathe in' },
      { type: 'exhale', durationSeconds: 6, cue: 'Breathe out' },
    ],
  },
];

export function getPatternById(id: string): Pattern {
  return PATTERNS.find((p) => p.id === id) ?? PATTERNS[0];
}

export const SESSION_DURATIONS = [
  { label: '1 min', seconds: 60 },
  { label: '3 min', seconds: 180 },
  { label: '5 min', seconds: 300 },
];

export const MOODS: Mood[] = [
  { id: 'much-calmer', label: 'Much calmer' },
  { id: 'calmer', label: 'Calmer' },
  { id: 'same', label: 'About the same' },
  { id: 'still-tense', label: 'Still tense' },
];

export const MIN_CUSTOM_MINUTES = 1;
export const MAX_CUSTOM_MINUTES = 30;
