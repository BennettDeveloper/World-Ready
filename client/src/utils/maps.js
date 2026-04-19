const MAPS_KEY = 'AIzaSyBFX1WHYFaE7N8ap91EWYsBTUNeON8FGOk'

export async function getCityTimeContext(lat, lng, cityName) {
  try {
    const timestamp = Math.floor(Date.now() / 1000)
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${MAPS_KEY}`
    )
    const data = await res.json()

    if (data.status !== 'OK') return { timeStr: '', contextString: '' }

    const localOffset = (data.rawOffset + data.dstOffset) * 1000
    const localTime = new Date(Date.now() + localOffset)
    const hours = localTime.getUTCHours()
    const minutes = String(localTime.getUTCMinutes()).padStart(2, '0')
    const period = hours >= 12 ? 'PM' : 'AM'
    const hour12 = hours % 12 || 12
    const timeStr = `${hour12}:${minutes} ${period}`
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
    const dayName = days[localTime.getUTCDay()]
    const isWeekend = localTime.getUTCDay() === 0 || localTime.getUTCDay() === 6

    let timeOfDay, mood
    if (hours >= 5 && hours < 9) {
      timeOfDay = 'early morning'
      mood = 'arrived early — focused and expects efficiency'
    } else if (hours >= 9 && hours < 12) {
      timeOfDay = 'mid-morning'
      mood = 'at peak focus — fully engaged and demanding'
    } else if (hours >= 12 && hours < 14) {
      timeOfDay = 'midday'
      mood = 'post-lunch — attentive but slightly more patient'
    } else if (hours >= 14 && hours < 17) {
      timeOfDay = 'afternoon'
      mood = 'deep in the workday — composed and direct'
    } else if (hours >= 17 && hours < 20) {
      timeOfDay = 'early evening'
      mood = 'wrapping up — less patient with wasted time'
    } else if (hours >= 20 && hours < 23) {
      timeOfDay = 'late evening'
      mood = 'staying late — tired but disciplined, expects concise answers'
    } else {
      timeOfDay = 'late night'
      mood = 'working through the night — maximum directness, no tolerance for vagueness'
    }

    const weekendNote = isWeekend
      ? ' This is a weekend interview — they made specific time for this.'
      : ''

    const contextString = `It is currently ${timeStr} on a ${dayName} ${timeOfDay} in ${cityName}. Your interviewer is ${mood}.${weekendNote}`

    return { timeStr, dayName, timeOfDay, timezone: data.timeZoneName, contextString, isWeekend }
  } catch {
    return { timeStr: '', contextString: '' }
  }
}