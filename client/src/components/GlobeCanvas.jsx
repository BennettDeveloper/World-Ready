import { useEffect, useRef } from 'react'
import { REGIONS_ARRAY } from '../data/regions'

export default function GlobeCanvas({ selectedRegion, onRegionClick }) {
  const canvasRef = useRef(null)
  const animRef   = useRef(null)
  const rotRef    = useRef({ phi: 0.3, theta: 0, targetPhi: 0.3, targetTheta: 0 })
  const mouseRef  = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx    = canvas.getContext('2d')
    let W = canvas.width  = canvas.offsetWidth
    let H = canvas.height = canvas.offsetHeight
    const R = Math.min(W, H) * 0.38

    if (selectedRegion) {
  const lngRad = (selectedRegion.lng * Math.PI) / 180
  rotRef.current.targetTheta = -lngRad
}

    function project(lat, lng) {
      const phi   = (90 - lat)  * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      const rot   = rotRef.current

      const x0 = Math.sin(phi) * Math.cos(theta)
      const y0 = Math.cos(phi)
      const z0 = Math.sin(phi) * Math.sin(theta)

      // Apply rotation
      const cosT = Math.cos(rot.theta), sinT = Math.sin(rot.theta)
      const cosP = Math.cos(rot.phi),   sinP = Math.sin(rot.phi)

      const x1 = cosT * x0 + sinT * z0
      const z1 = -sinT * x0 + cosT * z0
      const y1 = cosP * y0 - sinP * z1
      const z2 = sinP * y0 + cosP * z1

      return {
        x: W / 2 + x1 * R,
        y: H / 2 - y1 * R,
        visible: z2 > -0.1,
        depth: z2,
      }
    }

    function drawGlobe() {
      ctx.clearRect(0, 0, W, H)

      canvas.onclick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      REGIONS_ARRAY.forEach(region => {
        const p = project(region.lat, region.lng)
        if (!p.visible) return
        const dx = mx - p.x
        const dy = my - p.y
        if (Math.sqrt(dx*dx + dy*dy) < 16) {
          onRegionClick(region)
        }
      })
    }

    canvas.onmousemove = (e) => {
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top
      let hovering = false
      REGIONS_ARRAY.forEach(region => {
        const p = project(region.lat, region.lng)
        if (!p.visible) return
        const dx = mx - p.x
        const dy = my - p.y
        if (Math.sqrt(dx*dx + dy*dy) < 16) hovering = true
      })
      canvas.style.cursor = hovering ? 'pointer' : 'default'
    }


      // Outer glow
      const glow = ctx.createRadialGradient(W/2, H/2, R*0.7, W/2, H/2, R*1.4)
      glow.addColorStop(0, 'rgba(0,210,255,0.06)')
      glow.addColorStop(1, 'transparent')
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, W, H)

      // Globe base circle
      ctx.beginPath()
      ctx.arc(W/2, H/2, R, 0, Math.PI * 2)
      ctx.strokeStyle = 'rgba(0,210,255,0.15)'
      ctx.lineWidth = 1
      ctx.stroke()

      // Latitude lines
      for (let lat = -75; lat <= 75; lat += 15) {
        ctx.beginPath()
        let first = true
        for (let lng = -180; lng <= 180; lng += 3) {
          const p = project(lat, lng)
          if (!p.visible) { first = true; continue }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
          first = false
        }
        ctx.strokeStyle = 'rgba(0,210,255,0.08)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // Longitude lines
      for (let lng = -180; lng <= 180; lng += 20) {
        ctx.beginPath()
        let first = true
        for (let lat = -90; lat <= 90; lat += 3) {
          const p = project(lat, lng)
          if (!p.visible) { first = true; continue }
          first ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)
          first = false
        }
        ctx.strokeStyle = 'rgba(0,210,255,0.08)'
        ctx.lineWidth = 0.5
        ctx.stroke()
      }

      // City nodes
      REGIONS_ARRAY.forEach(region => {
        const p = project(region.lat, region.lng)
        if (!p.visible) return

        const isSelected = selectedRegion?.id === region.id
        const pulse = isSelected ? Math.sin(Date.now() * 0.004) * 3 : 0
        const r = isSelected ? 7 + pulse : 5

        // Glow ring
        if (isSelected) {
          ctx.beginPath()
          ctx.arc(p.x, p.y, r + 8, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(0,255,204,0.3)'
          ctx.lineWidth = 1
          ctx.stroke()

          ctx.beginPath()
          ctx.arc(p.x, p.y, r + 14, 0, Math.PI * 2)
          ctx.strokeStyle = 'rgba(0,255,204,0.1)'
          ctx.lineWidth = 1
          ctx.stroke()
        }

        // Node
        ctx.beginPath()
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2)
        ctx.fillStyle = isSelected ? '#00ffcc' : '#00d2ff'
        ctx.fill()

        // Label
        ctx.font = `${isSelected ? 600 : 400} 11px 'Space Grotesk', sans-serif`
        ctx.fillStyle = isSelected ? '#00ffcc' : 'rgba(0,210,255,0.8)'
        ctx.textAlign = 'center'
        ctx.fillText(region.label, p.x, p.y - r - 6)
      })

      // Connection arcs between selected node and others
      if (selectedRegion) {
        const origin = project(selectedRegion.lat, selectedRegion.lng)
        if (origin.visible) {
          REGIONS_ARRAY.forEach(region => {
            if (region.id === selectedRegion.id) return
            const p = project(region.lat, region.lng)
            if (!p.visible) return

            ctx.beginPath()
            const cpx = (origin.x + p.x) / 2
            const cpy = Math.min(origin.y, p.y) - 40
            ctx.moveTo(origin.x, origin.y)
            ctx.quadraticCurveTo(cpx, cpy, p.x, p.y)
            ctx.strokeStyle = 'rgba(0,210,255,0.12)'
            ctx.lineWidth = 0.5
            ctx.stroke()
          })
        }
      }
    }

    function tick() {
      // Smooth rotation lerp
      const rot = rotRef.current
      rot.theta += (rot.targetTheta - rot.theta) * 0.04

      // Auto-spin when nothing selected
      if (!selectedRegion) {
        rot.targetTheta += 0.003
      }

      drawGlobe()
      animRef.current = requestAnimationFrame(tick)
    }

    tick()

    const onResize = () => {
      W = canvas.width  = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', onResize)
    }
  }, [selectedRegion])

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )

}