const round5 = (n) => Math.round(n / 5) * 5;

export const getWeightRecommendation = (exerciseName, gymLog, targetRepMin) => {
  if (!exerciseName) return null;
  const name = exerciseName.toLowerCase().trim();

  // Find last session that contains this exercise
  const sorted = [...gymLog].sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt));
  let lastExercise = null;
  for (const session of sorted) {
    const match = session.exercises?.find((e) => e.name.toLowerCase().trim() === name);
    if (match) { lastExercise = match; break; }
  }

  if (!lastExercise || !lastExercise.sets?.length) return null;

  const sets = lastExercise.sets.filter((s) => s.weight > 0 && s.reps > 0);
  if (!sets.length) return null;

  const lastWeight = sets[sets.length - 1].weight;
  const unit = lastExercise.sets[0].unit ?? 'lbs';
  const minReps = targetRepMin ?? lastExercise.targetRepMin ?? 8;

  const missedAny = sets.some((s) => s.reps < minReps);
  const hitAll    = sets.every((s) => s.reps >= minReps);

  let recommendedWeight;
  let message;

  if (missedAny) {
    recommendedWeight = round5(lastWeight * 0.9);
    message = `Last time: ${lastWeight} ${unit} — missed your ${minReps}-rep target. Try ${recommendedWeight} ${unit} today.`;
  } else if (hitAll) {
    recommendedWeight = lastWeight + 5;
    message = `Last time: ${lastWeight} ${unit} — you hit it! Try ${recommendedWeight} ${unit} today.`;
  } else {
    recommendedWeight = lastWeight;
    message = `Last time: ${lastWeight} ${unit} — on target. Stick with ${lastWeight} ${unit}.`;
  }

  return { lastWeight, unit, recommendedWeight, message };
};
