import { useState } from 'react'
import GlobeCanvas from '../components/GlobeCanvas'
import { REGIONS_ARRAY } from '../data/regions'
import styles from '../styles/LandingPage.module.css'

export default function LandingPage({ onBegin, loading, error }) {
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [role, setRole] = useState('')

  const canBegin = selectedRegion !== null && role.trim().length > 0

  function handleBegin() {
    if (!canBegin || loading) return
    onBegin(selectedRegion, role.trim())
  }

  return (
    <div className={styles.page}>

      {/* LEFT — Hero text + region cards */}
      <div className={styles.left}>

        {/* Wordmark */}
        <div className={styles.wordmark}>
          <span className={styles.wordmarkMain}>WORLD</span>
          <span className={styles.wordmarkAccent}>READY</span>
        </div>

        {/* Hero text */}
        <div className={styles.hero}>
          <h1 className={styles.heroTitle}>
            Train for<br />
            <span className={styles.heroAccent}>the interviewer.</span>
          </h1>
          <p className={styles.heroSub}>
            You practiced the answer.<br />
            Did you practice being in the room?
          </p>
        </div>

        {/* Region cards */}
        <div className={styles.regionGrid}>
          {REGIONS_ARRAY.map(region => {
            const isSelected = selectedRegion?.id === region.id
            return (
              <button
                key={region.id}
                className={`${styles.regionCard} ${isSelected ? styles.regionCardSelected : ''}`}
                onClick={() => setSelectedRegion(isSelected ? null : region)}
              >
                <span className={styles.regionFlag}>{region.flag}</span>
                <div className={styles.regionInfo}>
                  <span className={styles.regionLabel}>{region.label}</span>
                  <span className={styles.regionName}>{region.interviewer}</span>
                  <span className={styles.regionTag}>{region.styleTag}</span>
                </div>
                {isSelected && (
                  <div className={styles.regionConnector} />
                )}
              </button>
            )
          })}
        </div>

        {/* Role input */}
        <div className={styles.inputGroup}>
          <input
            type="text"
            className={styles.roleInput}
            placeholder="Enter your target role  (e.g. Software Engineer)"
            value={role}
            onChange={e => setRole(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleBegin()}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button
            className={`${styles.beginBtn} ${canBegin ? styles.beginBtnActive : styles.beginBtnDisabled}`}
            onClick={handleBegin}
            disabled={!canBegin || loading}
          >
            {loading ? 'Connecting...' : 'Begin Interview →'}
          </button>
        </div>

        {/* Tagline */}
        <p className={styles.tagline}>
          Every room has different rules. Learn them all.
        </p>
      </div>

      {/* RIGHT — Globe */}
      <div className={styles.right}>
        <div className={styles.globeWrap}>
          <GlobeCanvas
            selectedRegion={selectedRegion}
            onRegionClick={setSelectedRegion}
          />
        </div>
      </div>
    </div>
  )
}