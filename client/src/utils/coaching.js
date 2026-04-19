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

const REGIONAL_TIPS = {
  london: "In London interviews, precision and evidence matter most. Reference specific processes, methodologies, or frameworks you've used.",
  mumbai: "Mumbai interviewers value adaptability and hunger. Show you thrive in fast-moving environments with concrete examples of learning speed.",
  tokyo: "Tokyo culture prizes group harmony and humility. Frame achievements as team efforts and show long-term commitment to the organization.",
  newyork: "New York interviewers want hard numbers. Always quantify your impact — percentages, revenue, users, or time saved.",
  paris: "Parisian interviewers appreciate intellectual depth. Connect your work to bigger ideas and show you think beyond the immediate task.",
  dubai: "Dubai values global ambition. Demonstrate cross-cultural experience and the ability to operate and influence at an enterprise scale.",
  sydney: "Sydney culture values authenticity. Be direct, skip the corporate speak, and show genuine self-awareness about your strengths and gaps.",
  beijing: "Beijing employers expect loyalty and collective mindset. Emphasize team contribution, long-term commitment, and respect for structure.",
};

function level(score) {
  return score < 70 ? 'low' : score < 85 ? 'mid' : 'high';
}

export function generateCoaching(scores, region) {
  const [cultural, clarity, confidence, roleAlignment, overall] = scores;
  const regionalTip = region ? REGIONAL_TIPS[region] : null;
  return [
    { category: 'Cultural Fluency', tip: TIPS.culturalFluency[level(cultural)], score: cultural, icon: '🌍' },
    { category: 'Communication Clarity', tip: TIPS.communicationClarity[level(clarity)], score: clarity, icon: '💬' },
    { category: 'Confidence', tip: TIPS.confidence[level(confidence)], score: confidence, icon: '💪' },
    { category: 'Role Alignment', tip: TIPS.roleAlignment[level(roleAlignment)], score: roleAlignment, icon: '🎯' },
    {
      category: 'Overall Performance',
      tip: regionalTip
        ? `${TIPS.overall[level(overall)]} ${regionalTip}`
        : TIPS.overall[level(overall)],
      score: overall,
      icon: '⭐',
    },
  ];
}

export function generateCoachingFromAI(feedback, scores) {
  return [
    { category: 'Cultural Fluency', tip: feedback.culturalAlignment, score: scores[0], icon: '🌍' },
    { category: 'Communication Clarity', tip: feedback.answerStructure, score: scores[1], icon: '💬' },
    { category: 'Confidence', tip: feedback.confidence, score: scores[2], icon: '💪' },
    { category: 'Role Alignment', tip: feedback.followUpHandling, score: scores[3], icon: '🎯' },
    { category: 'Filler Words & Flow', tip: feedback.fillerControl, score: scores[4], icon: '🗣️' },
  ];
}
