import { today, toDateStr, addMinutesToISO } from './dateUtils';

const minutesFromMidnight = (isoString) => {
  const d = new Date(isoString);
  return d.getHours() * 60 + d.getMinutes();
};

// Convert "HH:MM" goal string to minutes from midnight
const goalToMinutes = (timeStr) => {
  if (!timeStr) return null;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTimeStr = (minutes) => {
  const h = Math.floor(((minutes % 1440) + 1440) % 1440 / 60);
  const m = ((minutes % 1440) + 1440) % 1440 % 60;
  const ampm = h >= 12 ? 'pm' : 'am';
  const display = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${display}:${String(m).padStart(2, '0')} ${ampm}`;
};

export const computeSleepRecommendation = (sleepLog, goals) => {
  const targetBedtime = goals?.target_bedtime; // "HH:MM"
  const targetWake    = goals?.target_wake;    // "HH:MM"
  const goalHours     = goals?.sleep_hours ?? 8;

  if (!targetBedtime || !targetWake) {
    return {
      message: 'Set your target bedtime and wake time in Settings to get personalized recommendations.',
      wakeAnchor: null,
      tonightBedtime: null,
      doNotSleepPast: null,
      napCutoff: null,
      recoveryDays: null,
    };
  }

  const targetBedMin = goalToMinutes(targetBedtime);
  const targetWakeMin = goalToMinutes(targetWake);
  const wakeAnchorStr = minutesToTimeStr(targetWakeMin);

  // Get last 7 days of sleep entries
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = toDateStr(d);
    const entry = sleepLog.find((e) => e.date === dateStr);
    week.push({ date: dateStr, hours: entry?.durationHours ?? 0 });
  }

  const avgHours = week.reduce((s, d) => s + d.hours, 0) / 7;
  const debt = Math.max(0, week.reduce((s, d) => s + (goalHours - d.hours), 0));

  // Last night
  const lastEntry = sleepLog.length > 0
    ? sleepLog.sort((a, b) => new Date(b.loggedAt) - new Date(a.loggedAt))[0]
    : null;
  const lastHours = lastEntry?.durationHours ?? goalHours;

  // How far off is last bedtime from target?
  let shiftMin = 0;
  if (lastEntry?.bedtime) {
    const actualBedMin = minutesFromMidnight(lastEntry.bedtime);
    // Normalize shift (handle midnight crossing): shift > 0 means went to bed late
    let diff = actualBedMin - targetBedMin;
    if (diff > 720) diff -= 1440;
    if (diff < -720) diff += 1440;
    shiftMin = diff;
  }

  let tonightBedMin = targetBedMin;
  let message = '';
  let napCutoff = null;
  let recoveryDays = 0;

  if (lastHours < 3) {
    // All-nighter scenario
    tonightBedMin = targetBedMin - 60; // 1 hour early
    message = `You had very little sleep last night. Go to bed by ${minutesToTimeStr(tonightBedMin)} and wake at ${wakeAnchorStr} — sticking to your wake time is the fastest way to reset. Avoid naps after 3:00 pm.`;
    napCutoff = '3:00 pm';
    recoveryDays = 3;
  } else if (shiftMin > 90) {
    // Schedule shifted late
    const nightlyAdjust = 30;
    tonightBedMin = targetBedMin + shiftMin - nightlyAdjust;
    recoveryDays = Math.ceil(shiftMin / nightlyAdjust);
    message = `Your schedule shifted ${Math.round(shiftMin / 60 * 10) / 10}h late. Move your bedtime back by 30 min each night — tonight aim for ${minutesToTimeStr(tonightBedMin)}. Always wake at ${wakeAnchorStr}.`;
  } else if (debt > goalHours) {
    // Chronic debt — suggest going to bed slightly early
    tonightBedMin = targetBedMin - 30;
    recoveryDays = Math.ceil(debt / 0.5);
    message = `You have ${Math.round(debt * 10) / 10}h of sleep debt this week. Try going to bed 30 min earlier — tonight at ${minutesToTimeStr(tonightBedMin)}. Wake at ${wakeAnchorStr} each day.`;
  } else {
    message = `You're on track! Keep your ${minutesToTimeStr(targetBedMin)} bedtime and wake at ${wakeAnchorStr}.`;
    recoveryDays = 0;
  }

  const doNotSleepPastMin = targetBedMin + 120; // target + 2hrs = hard cutoff

  return {
    tonightBedtime: minutesToTimeStr(tonightBedMin),
    doNotSleepPast: minutesToTimeStr(doNotSleepPastMin),
    wakeAnchor: wakeAnchorStr,
    napCutoff,
    recoveryDays,
    message,
    debtHours: Math.round(debt * 10) / 10,
    avgHours: Math.round(avgHours * 10) / 10,
  };
};
