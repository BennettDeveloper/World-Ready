const TIPS = {
  culturalFluency: {
    low: "Deepen your cultural research — explicitly reference the region's norms, values, and communication style in your answers.",
    mid: "You showed some cultural awareness. Try weaving more region-specific language and shared values into your responses.",
    high: "Excellent cultural fluency! You naturally mirrored the region's communication style and values.",
  },
  communicationClarity: {
    low: "Use the STAR method: Situation, Task, Action, Result. Every behavioral answer should have a clear structure with a concrete outcome.",
    mid: "Your structure was decent. Try to always close each answer with a specific result or measurable outcome.",
    high: "Very clear communicator! Your structured answers and use of concrete outcomes made you easy to follow.",
  },
  confidence: {
    low: "Lead with action verbs — 'I led', 'I built', 'I delivered'. Avoid filler words like 'um', 'maybe', or 'I'm not sure.'",
    mid: "You showed confidence at times. Minimize hedging language and own your achievements without qualification.",
    high: "Great confident delivery! Your assertive language and ownership of your work projected leadership.",
  },
  roleAlignment: {
    low: "Tie your experience directly to the role. Mirror the job title's key terms back in your answers to demonstrate alignment.",
    mid: "You made some connections between your background and the role. Be more explicit — name the skills the role requires.",
    high: "Strong role alignment! Your answers clearly demonstrated fit and painted a picture of you in the role.",
  },
  overall: {
    low: "Keep practicing — cultural interview prep takes repetition. Try a different region to expand your range.",
    mid: "Solid foundation. Focus on depth of answers, cultural specificity, and confident delivery to stand out.",
    high: "Outstanding overall performance! You're demonstrating truly World-Ready interview skills.",
  },
};

function level(score) {
  return score < 70 ? 'low' : score < 85 ? 'mid' : 'high';
}

export function generateCoaching(scores) {
  const [cultural, clarity, confidence, roleAlignment, overall] = scores;
  return [
    { category: 'Cultural Fluency', tip: TIPS.culturalFluency[level(cultural)], score: cultural, icon: '🌍' },
    { category: 'Communication Clarity', tip: TIPS.communicationClarity[level(clarity)], score: clarity, icon: '💬' },
    { category: 'Confidence', tip: TIPS.confidence[level(confidence)], score: confidence, icon: '💪' },
    { category: 'Role Alignment', tip: TIPS.roleAlignment[level(roleAlignment)], score: roleAlignment, icon: '🎯' },
    { category: 'Overall Performance', tip: TIPS.overall[level(overall)], score: overall, icon: '⭐' },
  ];
}
