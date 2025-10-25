import { ref } from 'vue'

export function useVisualizer() {
  // State
  const canvas = ref(null)
  const canvasContext = ref(null)
  const analyserNode = ref(null)
  const animationId = ref(null)
  const isRunning = ref(false)
  const visualizationType = ref('spectrum')
  const colorScheme = ref('rainbow')
  
  // Configuration
  const config = {
    barWidth: 3,
    barGap: 1,
    minBarHeight: 2
  }
  
  /**
   * Initialize canvas
   */
  const initCanvas = (canvasElement) => {
    if (!canvasElement) {
      console.error('❌ Canvas element is null')
      return false
    }
    
    canvas.value = canvasElement
    canvasContext.value = canvasElement.getContext('2d')
    
    if (!canvasContext.value) {
      console.error('❌ Could not get 2d context')
      return false
    }
    
    // Set canvas size - CRITICAL FIX: Force proper sizing
    const parent = canvasElement.parentElement
    if (parent) {
      const rect = parent.getBoundingClientRect()
      // Use computed width/height, not just rect
      const computedStyle = window.getComputedStyle(canvasElement)
      const width = Math.max(rect.width, 800)
      const height = Math.max(
        parseInt(computedStyle.height) || 300,
        300
      )
      
      // Set canvas internal resolution
      canvas.value.width = width
      canvas.value.height = height
      
      console.log('✅ Canvas initialized with size:', width, 'x', height)
    } else {
      // Fallback if no parent
      canvas.value.width = 800
      canvas.value.height = 300
      console.log('⚠️ Canvas initialized with fallback size')
    }
    
    // Add resize listener
    window.addEventListener('resize', resizeCanvas)
    
    console.log('✅ Canvas initialized')
    console.log('📊 Canvas dimensions:', canvas.value.width, 'x', canvas.value.height)
    
    return true
  }
  
  /**
   * Resize canvas to match container
   */
  const resizeCanvas = () => {
    if (!canvas.value) return
    
    const parent = canvas.value.parentElement
    if (!parent) return
    
    const rect = parent.getBoundingClientRect()
    
    // Get computed height from CSS
    const computedStyle = window.getComputedStyle(canvas.value)
    const width = Math.max(rect.width, 100)
    const height = Math.max(
      parseInt(computedStyle.height) || 300,
      300
    )
    
    // Only resize if dimensions actually changed
    if (canvas.value.width !== width || canvas.value.height !== height) {
      canvas.value.width = width
      canvas.value.height = height
      console.log('📐 Canvas resized:', width, 'x', height)
    }
  }
  
  /**
   * Set analyser node
   */
  const setAnalyser = (analyser) => {
    if (!analyser) {
      console.error('❌ Analyser is null')
      return false
    }
    
    analyserNode.value = analyser
    
    // CRITICAL FIX: Ensure FFT size is set properly
    if (!analyser.fftSize || analyser.fftSize < 32) {
      analyser.fftSize = 2048
      console.log('⚠️ FFT size was not set, set to 2048')
    }
    
    console.log('✅ Analyser connected to visualizer')
    console.log('📊 FFT Size:', analyser.fftSize)
    console.log('📊 Frequency Bins:', analyser.frequencyBinCount)
    console.log('📊 Sample Rate:', analyser.context?.sampleRate || 'unknown')
    
    return true
  }
  
  /**
   * Start visualization
   */
  const start = () => {
    if (!analyserNode.value) {
      console.error('❌ Cannot start: No analyser')
      return false
    }
    
    if (!canvasContext.value) {
      console.error('❌ Cannot start: No canvas context')
      return false
    }
    
    if (!canvas.value) {
      console.error('❌ Cannot start: No canvas')
      return false
    }
    
    if (isRunning.value) {
      console.log('ℹ️ Visualizer already running')
      return true
    }
    
    console.log('▶️ Starting visualizer...')
    console.log('📊 Visualization type:', visualizationType.value)
    console.log('🎨 Color scheme:', colorScheme.value)
    console.log('📐 Canvas size:', canvas.value.width, 'x', canvas.value.height)
    
    isRunning.value = true
    animate()
    
    console.log('✅ Visualizer started')
    return true
  }
  
  /**
   * Stop visualization
   */
  const stop = () => {
    if (animationId.value) {
      cancelAnimationFrame(animationId.value)
      animationId.value = null
    }
    isRunning.value = false
    
    // Clear canvas
    if (canvasContext.value && canvas.value) {
      canvasContext.value.clearRect(0, 0, canvas.value.width, canvas.value.height)
    }
    
    console.log('⏹️ Visualizer stopped')
  }
  
  /**
   * Animation loop
   */
  const animate = () => {
    if (!isRunning.value) {
      console.log('⏹️ Animation stopped')
      return
    }
    
    animationId.value = requestAnimationFrame(animate)
    
    try {
      // CRITICAL FIX: Always check canvas dimensions
      if (canvas.value.width === 0 || canvas.value.height === 0) {
        console.warn('⚠️ Canvas has zero dimensions, trying to resize...')
        resizeCanvas()
        drawEmptyState()
        return
      }
      
      // Get frequency data
      const bufferLength = analyserNode.value.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)
      analyserNode.value.getByteFrequencyData(dataArray)
      
      // Check if we're receiving data
      const maxValue = Math.max(...dataArray)
      const hasData = maxValue > 0
      
      if (!hasData) {
        // Draw empty state (but still valid)
        drawEmptyState()
        return
      }
      
      // DEBUGGING: Log data occasionally
      if (Math.random() < 0.01) { // 1% chance per frame
        console.log('📊 Audio data received, max value:', maxValue)
      }
      
      // Draw based on visualization type
      switch (visualizationType.value) {
        case 'spectrum':
          drawSpectrum(dataArray)
          break
        case 'waveform':
          drawWaveform()
          break
        case 'circular':
          drawCircular(dataArray)
          break
        case 'bars3d':
          drawBars3D(dataArray)
          break
        default:
          drawSpectrum(dataArray)
      }
    } catch (error) {
      console.error('❌ Animation error:', error)
      stop()
    }
  }
  
  /**
   * Draw empty state (waiting for audio)
   */
  const drawEmptyState = () => {
    const ctx = canvasContext.value
    const width = canvas.value.width
    const height = canvas.value.height
    
    if (width === 0 || height === 0) {
      console.warn('⚠️ Cannot draw empty state: zero dimensions')
      return
    }
    
    // Dark background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
    ctx.fillRect(0, 0, width, height)
    
    // Message
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
    ctx.font = '16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Waiting for audio...', width / 2, height / 2)
    
    // Draw a simple pulsing circle to show it's working
    const time = Date.now() / 1000
    const radius = 20 + Math.sin(time * 2) * 5
    ctx.beginPath()
    ctx.arc(width / 2, height / 2 + 40, radius, 0, Math.PI * 2)
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.5)'
    ctx.lineWidth = 2
    ctx.stroke()
  }
  
  /**
   * Draw spectrum bars
   */
  const drawSpectrum = (dataArray) => {
    const ctx = canvasContext.value
    const width = canvas.value.width
    const height = canvas.value.height
    
    // Clear canvas with fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, width, height)
    
    // ✅ SIMPLIFIED: Fixed number of bars
    const barCount = 150
    
    // ✅ GUARANTEED FULL WIDTH: Each bar gets equal space
    const barSpacing = width / barCount  // Total space per bar (including gap)
    const barWidth = Math.max(1, barSpacing - 1)  // Leave 1px gap between bars
    
    // Logarithmic frequency sampling (better for music visualization)
    for (let i = 0; i < barCount; i++) {
      // Logarithmic mapping: more detail in bass/mids
      const normalizedIndex = i / barCount  // 0 to 1
      const logIndex = Math.pow(normalizedIndex, 1.5)
      const dataIndex = Math.floor(logIndex * (dataArray.length - 1))
      
      const value = dataArray[dataIndex]
      const normalizedHeight = (value / 255) * height * 0.9
      const barHeight = Math.max(config.minBarHeight, normalizedHeight)
      
      // ✅ GUARANTEED: Position spans exactly from 0 to width
      const x = i * barSpacing
      const y = height - barHeight
      
      // Get color based on scheme
      const color = getColor(i, barCount, value)
      
      ctx.fillStyle = color
      ctx.fillRect(x, y, barWidth, barHeight)
    }
  }
  
  /**
   * Draw waveform
   */
  const drawWaveform = () => {
    const ctx = canvasContext.value
    const width = canvas.value.width
    const height = canvas.value.height
    
    // Get time domain data
    const bufferLength = analyserNode.value.fftSize
    const dataArray = new Uint8Array(bufferLength)
    analyserNode.value.getByteTimeDomainData(dataArray)
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, width, height)
    
    // Draw waveform
    ctx.lineWidth = 2
    ctx.strokeStyle = getColor(0, 1, 128)
    ctx.beginPath()
    
    const sliceWidth = width / bufferLength
    let x = 0
    
    for (let i = 0; i < bufferLength; i++) {
      const v = dataArray[i] / 128.0
      const y = v * height / 2
      
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
      
      x += sliceWidth
    }
    
    ctx.lineTo(width, height / 2)
    ctx.stroke()
  }
  
  /**
   * Draw circular visualization
   */
  const drawCircular = (dataArray) => {
    const ctx = canvasContext.value
    const width = canvas.value.width
    const height = canvas.value.height
    const centerX = width / 2
    const centerY = height / 2
    const radius = Math.min(width, height) / 4
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, width, height)
    
    const barCount = 180  // Full circle with good detail
    
    for (let i = 0; i < barCount; i++) {
      // ✅ Logarithmic frequency sampling
      const normalizedIndex = i / barCount
      const logIndex = Math.pow(normalizedIndex, 1.5)
      const dataIndex = Math.floor(logIndex * (dataArray.length - 1))
      
      const value = dataArray[dataIndex]
      const barHeight = (value / 255) * radius
      const angle = (i / barCount) * Math.PI * 2
      
      const x1 = centerX + Math.cos(angle) * radius
      const y1 = centerY + Math.sin(angle) * radius
      const x2 = centerX + Math.cos(angle) * (radius + barHeight)
      const y2 = centerY + Math.sin(angle) * (radius + barHeight)
      
      ctx.strokeStyle = getColor(i, barCount, value)
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    }
  }
  
  /**
   * Draw 3D bars
   */
  const drawBars3D = (dataArray) => {
    const ctx = canvasContext.value
    const width = canvas.value.width
    const height = canvas.value.height
    
    // Clear canvas
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fillRect(0, 0, width, height)
    
    // ✅ Fewer bars for 3D (wider bars look better in 3D)
    const barCount = 80
    
    // ✅ GUARANTEED FULL WIDTH
    const barSpacing = width / barCount
    const barWidth = Math.max(2, barSpacing - 2)  // Leave 2px gap for 3D depth
    
    const perspective = 0.7
    
    for (let i = 0; i < barCount; i++) {
      // Logarithmic frequency sampling
      const normalizedIndex = i / barCount
      const logIndex = Math.pow(normalizedIndex, 1.5)
      const dataIndex = Math.floor(logIndex * (dataArray.length - 1))
      
      const value = dataArray[dataIndex]
      const barHeight = Math.max(config.minBarHeight, (value / 255) * height * 0.8)
      
      // ✅ Position to fill full width
      const x = i * barSpacing
      const y = height - barHeight
      
      // Draw 3D effect
      const color = getColor(i, barCount, value)
      
      // Front face
      ctx.fillStyle = color
      ctx.fillRect(x, y, barWidth, barHeight)
      
      // Top face (perspective)
      ctx.fillStyle = adjustColorBrightness(color, 1.3)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + barWidth, y)
      ctx.lineTo(x + barWidth + 5 * perspective, y - 5 * perspective)
      ctx.lineTo(x + 5 * perspective, y - 5 * perspective)
      ctx.closePath()
      ctx.fill()
      
      // Right face (perspective)
      ctx.fillStyle = adjustColorBrightness(color, 0.7)
      ctx.beginPath()
      ctx.moveTo(x + barWidth, y)
      ctx.lineTo(x + barWidth + 5 * perspective, y - 5 * perspective)
      ctx.lineTo(x + barWidth + 5 * perspective, y + barHeight - 5 * perspective)
      ctx.lineTo(x + barWidth, y + barHeight)
      ctx.closePath()
      ctx.fill()
    }
  }
  
  /**
   * Get color based on scheme
   */
  const getColor = (index, total, value) => {
    const intensity = value / 255
    
    switch (colorScheme.value) {
      case 'rainbow':
        const hue = (index / total) * 360
        return `hsl(${hue}, 100%, ${50 + intensity * 20}%)`
      
      case 'fire':
        const red = 255
        const green = Math.floor(intensity * 200)
        const blue = 0
        return `rgb(${red}, ${green}, ${blue})`
      
      case 'ocean':
        return `rgb(0, ${Math.floor(intensity * 150)}, ${Math.floor(150 + intensity * 105)})`
      
      case 'neon':
        const neonHue = (index / total) * 120 + 180
        return `hsl(${neonHue}, 100%, ${50 + intensity * 30}%)`
      
      case 'monochrome':
        const gray = Math.floor(intensity * 255)
        return `rgb(${gray}, ${gray}, ${gray})`
      
      case 'vintage':
        const r = Math.floor(200 + intensity * 55)
        const g = Math.floor(150 + intensity * 55)
        const b = Math.floor(100 + intensity * 55)
        return `rgb(${r}, ${g}, ${b})`
      
      default:
        return `hsl(${(index / total) * 360}, 100%, 50%)`
    }
  }
  
  /**
   * Adjust color brightness
   */
  const adjustColorBrightness = (color, factor) => {
    // Parse RGB color
    const rgb = color.match(/\d+/g)
    if (!rgb) return color
    
    const r = Math.min(255, Math.floor(parseInt(rgb[0]) * factor))
    const g = Math.min(255, Math.floor(parseInt(rgb[1]) * factor))
    const b = Math.min(255, Math.floor(parseInt(rgb[2]) * factor))
    
    return `rgb(${r}, ${g}, ${b})`
  }
  
  /**
   * Set visualization type
   */
  const setVisualizationType = (type) => {
    visualizationType.value = type
    console.log('🎨 Visualization type changed to:', type)
  }
  
  /**
   * Set color scheme
   */
  const setColorScheme = (scheme) => {
    colorScheme.value = scheme
    console.log('🎨 Color scheme changed to:', scheme)
  }
  
  /**
   * Cleanup
   */
  const cleanup = () => {
    stop()
    window.removeEventListener('resize', resizeCanvas)
  }
  
  return {
    // State
    isRunning,
    visualizationType,
    colorScheme,
    
    // Methods
    initCanvas,
    setAnalyser,
    start,
    stop,
    setVisualizationType,
    setColorScheme,
    cleanup
  }
}
