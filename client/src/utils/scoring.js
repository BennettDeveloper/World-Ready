const CULTURAL_KEYWORDS = {
  london: ['structure', 'professional', 'formal', 'process', 'procedure', 'methodical', 'composed', 'measured', 'rigour', 'precision'],
  mumbai: ['growth', 'learn', 'family', 'team', 'vision', 'long-term', 'relationship', 'passion', 'ambition', 'journey'],
  tokyo: ['team', 'group', 'humble', 'detail', 'precise', 'harmony', 'respect', 'careful', 'quality', 'collective'],
  newyork: ['result', 'impact', 'metric', 'data', 'deliver', 'achieve', 'drive', 'goal', 'performance', 'revenue'],
  paris: ['creative', 'innovation', 'balance', 'culture', 'aesthetic', 'philosophy', 'intellectual', 'concept', 'design'],
  dubai: ['ambitious', 'opportunity', 'global', 'diverse', 'network', 'enterprise', 'vision', 'leadership', 'scale'],
  sydney: ['collaborate', 'practical', 'adapt', 'initiative', 'direct', 'honest', 'authentic', 'team', 'balance'],
  beijing: ['collective', 'long-term', 'harmony', 'respect', 'hierarchy', 'stability', 'diligent', 'loyal', 'dedicated'],
};

const STAR_WORDS = [
  'situation', 'task', 'action', 'result', 'challenge', 'because', 'therefore',
  'led to', 'resulted in', 'i implemented', 'i achieved', 'the outcome', 'specifically',
  'consequently', 'as a result', 'in order to',
];

const CONFIDENT_WORDS = [
  'led', 'managed', 'drove', 'achieved', 'created', 'built', 'delivered',
  'launched', 'developed', 'established', 'increased', 'reduced', 'improved',
  'designed', 'spearheaded', 'championed', 'initiated',
];

const HEDGE_WORDS = [
  "don't know", "maybe", "not sure", "kind of", "sort of",
  " um ", " uh ", "umm", "uhh", "i guess", "i suppose",
];

function clamp(val, min = 45, max = 98) {
  return Math.min(max, Math.max(min, Math.round(val)));
}

export function scoreAnswers(answers, region, role) {
  if (!answers || answers.length === 0) {
    return [65, 65, 65, 65, 65];
  }

  let culturalTotal = 0, clarityTotal = 0, confidenceTotal = 0, roleTotal = 0;
  const regionalKeywords = CULTURAL_KEYWORDS[region] || [];
  const roleWords = role.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  answers.forEach(answer => {
    const a = answer.toLowerCase();
    const wordCount = a.split(/\s+/).filter(w => w.length > 0).length;
    const lengthFactor = Math.min(wordCount / 60, 1);

    const culturalHits = regionalKeywords.filter(k => a.includes(k)).length;
    culturalTotal += 52 + (culturalHits / Math.max(regionalKeywords.length, 1)) * 38 + lengthFactor * 8;

    const starHits = STAR_WORDS.filter(k => a.includes(k)).length;
    clarityTotal += 48 + (starHits / STAR_WORDS.length) * 42 + lengthFactor * 8;

    const confHits = CONFIDENT_WORDS.filter(k => a.includes(k)).length;
    const hedgePenalty = HEDGE_WORDS.filter(k => a.includes(k)).length * 5;
    confidenceTotal += 50 + (confHits / CONFIDENT_WORDS.length) * 40 + lengthFactor * 6 - hedgePenalty;

    const roleHits = roleWords.filter(k => a.includes(k)).length;
    roleTotal += 50 + (roleHits / Math.max(roleWords.length, 1)) * 35 + lengthFactor * 10;
  });

  const n = answers.length;
  const cultural = clamp(culturalTotal / n);
  const clarity = clamp(clarityTotal / n);
  const confidence = clamp(confidenceTotal / n);
  const roleAlignment = clamp(roleTotal / n);
  const overall = clamp((cultural + clarity + confidence + roleAlignment) / 4);

  return [cultural, clarity, confidence, roleAlignment, overall];
}
