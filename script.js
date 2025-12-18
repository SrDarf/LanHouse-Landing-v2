document.addEventListener("DOMContentLoaded", () => {
  const lightContainer = document.getElementById("light-container")
  const dynamicWord = document.getElementById("dynamic-word")
  const mascotContainer = document.getElementById("mascot-container")
  const mascotImage = document.getElementById("mascot-image")

  const isMobile = window.matchMedia("(max-width: 1023px)").matches

  const CONFIG = {
    minSize: 18,
    maxSize: 28,
    minBlur: 4,
    maxBlur: 10,
    minDuration: 25,
    maxDuration: 45,
    spawnInterval: 500,
    maxLights: isMobile ? 5 : 25,
    fadeInDuration: 1500,
    windChance: 0.8,
    minWindDrift: isMobile ? 10 : 100,
    maxWindDrift: isMobile ? 200 : 1000,
  }

  let activeDynamicLights = []

  function random(min, max) {
    return Math.random() * (max - min) + min
  }

  function createDynamicLight() {
    if (activeDynamicLights.length >= CONFIG.maxLights) {
      return
    }

    const light = document.createElement("div")
    light.className = "light-dynamic"

    const size = random(CONFIG.minSize, CONFIG.maxSize)
    light.style.width = `${size}rem`
    light.style.height = `${size}rem`

    const blur = random(CONFIG.minBlur, CONFIG.maxBlur)
    light.style.filter = `blur(${blur}px)`

    const hasWind = Math.random() < CONFIG.windChance
    const maxLeft = hasWind ? 70 : 85
    const leftPosition = random(-15, maxLeft)
    light.style.left = `${leftPosition}%`

    const topPosition = random(-15, 0)
    light.style.top = `${topPosition}%`

    const startRotation = random(-30, 30)
    const endRotation = random(-60, 60)
    light.style.setProperty("--start-rotation", `${startRotation}deg`)
    light.style.setProperty("--end-rotation", `${endRotation}deg`)

    if (hasWind) {
      const windDrift = random(CONFIG.minWindDrift, CONFIG.maxWindDrift)
      light.style.setProperty("--wind-drift", `${windDrift}px`)
    }

    const baseDuration = random(CONFIG.minDuration, CONFIG.maxDuration)
    const durationMultiplier = (100 - topPosition) / 110
    const duration = baseDuration * durationMultiplier

    lightContainer.appendChild(light)
    activeDynamicLights.push(light)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        light.classList.add("visible")
      })
    })

    setTimeout(() => {
      const animationName = hasWind ? "fallWithWind" : "fallStraight"
      light.style.animation = `${animationName} ${duration}s linear forwards`
    }, 200)

    const totalDuration = duration * 1000 + 500
    setTimeout(() => {
      light.classList.remove("visible")

      setTimeout(() => {
        if (light.parentNode) {
          light.parentNode.removeChild(light)
        }
        activeDynamicLights = activeDynamicLights.filter((b) => b !== light)
      }, CONFIG.fadeInDuration)
    }, totalDuration)
  }

  function initializeLights() {
    for (let i = 0; i < 4; i++) {
      setTimeout(() => {
        createDynamicLight()
      }, i * 800)
    }
  }

  function startLightSpawner() {
    setInterval(() => {
      createDynamicLight()
    }, CONFIG.spawnInterval)
  }

  initializeLights()
  startLightSpawner()

  console.log("LanHouse - Sistema de luzes dinâmico ativado!")

  const words = ["Programar", "Conversar", "Estudar", "Aprender", "Criar", "Inovar", "Compartilhar", "Explorar"]

  let currentIndex = 0
  let isAnimating = false

  function updateDataText() {
    const text = dynamicWord.textContent
    dynamicWord.setAttribute("data-text", text)
  }

  function changeWord() {
    if (isAnimating) return
    isAnimating = true

    dynamicWord.classList.remove("fade-in")
    dynamicWord.classList.add("fade-out")

    setTimeout(() => {
      currentIndex = (currentIndex + 1) % words.length
      const newWord = words[currentIndex]

      dynamicWord.textContent = newWord
      dynamicWord.setAttribute("data-text", newWord)

      dynamicWord.classList.remove("fade-out")
      dynamicWord.classList.add("fade-in")

      setTimeout(() => {
        dynamicWord.classList.remove("fade-in")
        isAnimating = false
      }, 500)
    }, 500)
  }

  updateDataText()
  setInterval(changeWord, 3000)

  const buttons = document.querySelectorAll(".btn")

  buttons.forEach((btn) => {
    btn.addEventListener("mousemove", (e) => {
      const rect = btn.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      btn.style.setProperty("--mouse-x", `${x}px`)
      btn.style.setProperty("--mouse-y", `${y}px`)
    })
  })

  const PROXIMITY_THRESHOLD = 500
  const MAX_ROTATION = 15
  const MAX_MOVE = 30

  if (mascotContainer && !isMobile) {
    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let isAnimatingParallax = false

    function lerp(start, end, factor) {
      return start + (end - start) * factor
    }

    function animate() {
      currentX = lerp(currentX, targetX, 0.08)
      currentY = lerp(currentY, targetY, 0.08)

      const rotateY = (currentX / MAX_MOVE) * MAX_ROTATION
      const rotateX = -(currentY / MAX_MOVE) * MAX_ROTATION

      mascotContainer.style.transform = `
        translate(${currentX}px, ${currentY}px)
        perspective(1000px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
      `

      if (Math.abs(currentX - targetX) > 0.01 || Math.abs(currentY - targetY) > 0.01) {
        requestAnimationFrame(animate)
      } else {
        isAnimatingParallax = false
      }
    }

    function startAnimation() {
      if (!isAnimatingParallax) {
        isAnimatingParallax = true
        requestAnimationFrame(animate)
      }
    }

    document.addEventListener("mousemove", (e) => {
      const rect = mascotContainer.getBoundingClientRect()
      const mascotCenterX = rect.left + rect.width / 2
      const mascotCenterY = rect.top + rect.height / 2

      const distanceX = e.clientX - mascotCenterX
      const distanceY = e.clientY - mascotCenterY
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      if (distance < PROXIMITY_THRESHOLD) {
        mascotContainer.classList.add("parallax-active")

        const intensity = 1 - distance / PROXIMITY_THRESHOLD
        const easedIntensity = intensity * intensity

        targetX = (distanceX / PROXIMITY_THRESHOLD) * MAX_MOVE * easedIntensity
        targetY = (distanceY / PROXIMITY_THRESHOLD) * MAX_MOVE * easedIntensity
      } else {
        mascotContainer.classList.remove("parallax-active")
        targetX = 0
        targetY = 0
      }

      startAnimation()
    })

    document.addEventListener("mouseleave", () => {
      mascotContainer.classList.remove("parallax-active")
      targetX = 0
      targetY = 0
      startAnimation()
    })
  }

  const LIGHT_GLOW_THRESHOLD = 150

  function handleLightGlow(e) {
    const lights = document.querySelectorAll(".light, .light-dynamic.visible")

    lights.forEach((light) => {
      const rect = light.getBoundingClientRect()
      const lightCenterX = rect.left + rect.width / 2
      const lightCenterY = rect.top + rect.height / 2

      const distanceX = e.clientX - lightCenterX
      const distanceY = e.clientY - lightCenterY
      const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY)

      if (distance < LIGHT_GLOW_THRESHOLD) {
        light.classList.add("glowing")
      } else {
        light.classList.remove("glowing")
      }
    })
  }

  document.addEventListener("mousemove", handleLightGlow)

function shakeScreen() {
  document.body.classList.remove("shake")
  void document.body.offsetWidth // força reflow
  document.body.classList.add("shake")
}


let clickCount = 0
let clickTimer = null
let physicsActive = false

const mouseCountEl = document.getElementById("mouseCount")

if (mascotImage) {
  mascotImage.addEventListener("click", () => {
    clickCount++
    
    mouseCountEl.textContent = `${clickCount}x`
    shakeScreen()

    if (clickTimer) clearTimeout(clickTimer)

    clickTimer = setTimeout(() => {
      clickCount = 0
      mouseCountEl.textContent = `0x`
    }, 1000)

    if (clickCount >= 3 && physicsActive) {
      location.reload()
      return
    }

    if (clickCount >= 3 && !physicsActive) {
      clickCount = 0
      mouseCountEl.textContent = `0x`
      physicsActive = true
      activatePhysicsEasterEgg()
    }
  })
}


function activatePhysicsEasterEgg() {
  const heading = document.querySelector(".heading")
  const subtitle = document.querySelector(".subtitle")
  const brandText = document.querySelector(".brand-text")

  const textElements = [heading, subtitle, brandText].filter((el) => el)
  const allLetters = []

  textElements.forEach((element) => {
    const text = element.textContent
    const rect = element.getBoundingClientRect()
    const computedStyle = window.getComputedStyle(element)
    const fontSize = Number.parseFloat(computedStyle.fontSize)
    const isGradient =
      element.classList.contains("gradient-text") ||
      element.closest(".gradient-text")

    const tempSpan = document.createElement("span")
    tempSpan.style.cssText = `
      position: absolute;
      visibility: hidden;
      font-family: ${computedStyle.fontFamily};
      font-size: ${computedStyle.fontSize};
      font-weight: ${computedStyle.fontWeight};
      letter-spacing: ${computedStyle.letterSpacing};
    `
    document.body.appendChild(tempSpan)

    let currentX = rect.left

    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      if (char === " ") {
        tempSpan.textContent = " "
        currentX += tempSpan.offsetWidth || fontSize * 0.3
        continue
      }

      tempSpan.textContent = char
      const charWidth = tempSpan.offsetWidth

      const letter = document.createElement("span")
      letter.className =
        "physics-letter" + (isGradient ? " gradient-text" : "")
      letter.textContent = char
      letter.style.cssText = `
        position: absolute;
        left: ${currentX}px;
        top: ${rect.top}px;
        font-size: ${fontSize}px;
        font-family: ${computedStyle.fontFamily};
        font-weight: ${computedStyle.fontWeight};
        cursor: grab;
      `

      document.body.appendChild(letter)

      allLetters.push({
        element: letter,
        x: currentX,
        y: rect.top,
        vx: (Math.random() - 0.5) * 6,
        vy: Math.random() * -2,
        width: charWidth,
        height: fontSize,
        dragging: false,
      })

      currentX += charWidth
    }

    document.body.removeChild(tempSpan)
    element.style.visibility = "hidden"
  })


  const gravity = 0.5
  const friction = 0.98
  const bounceFactor = 0.65
  const groundY = window.innerHeight - 40

  function checkCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    )
  }

  function resolveCollision(a, b) {
    const overlapX =
      Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x)
    const overlapY =
      Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y)

    if (overlapX < overlapY) {
      const push = overlapX / 2
      if (a.x < b.x) {
        a.x -= push
        b.x += push
      } else {
        a.x += push
        b.x -= push
      }

      const temp = a.vx
      a.vx = b.vx * bounceFactor
      b.vx = temp * bounceFactor
    } else {
      const push = overlapY / 2
      if (a.y < b.y) {
        a.y -= push
        b.y += push
      } else {
        a.y += push
        b.y -= push
      }

      const temp = a.vy
      a.vy = b.vy * bounceFactor
      b.vy = temp * bounceFactor
    }
  }

  function updatePhysics() {
    allLetters.forEach((letter) => {
      if (letter.dragging) return

      letter.vy += gravity
      letter.x += letter.vx
      letter.y += letter.vy
      letter.vx *= friction

      if (letter.x < 0) {
        letter.x = 0
        letter.vx *= -bounceFactor
      }

      if (letter.x > window.innerWidth - letter.width) {
        letter.x = window.innerWidth - letter.width
        letter.vx *= -bounceFactor
      }

      if (letter.y > groundY - letter.height) {
        letter.y = groundY - letter.height
        letter.vy *= -bounceFactor
        if (Math.abs(letter.vy) < 1) letter.vy = 0
      }
    })

    for (let i = 0; i < allLetters.length; i++) {
      for (let j = i + 1; j < allLetters.length; j++) {
        const a = allLetters[i]
        const b = allLetters[j]
        if (a.dragging || b.dragging) continue
        if (checkCollision(a, b)) resolveCollision(a, b)
      }
    }

    allLetters.forEach((letter) => {
      letter.element.style.left = `${letter.x}px`
      letter.element.style.top = `${letter.y}px`
    })

    requestAnimationFrame(updatePhysics)
  }

  let draggedLetter = null
  let dragOffsetX = 0
  let dragOffsetY = 0
  let lastX = 0
  let lastY = 0

  function startDrag(x, y) {
    allLetters.forEach((letter) => {
      const r = letter.element.getBoundingClientRect()
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) {
        draggedLetter = letter
        letter.dragging = true
        letter.element.style.cursor = "grabbing"
        dragOffsetX = x - letter.x
        dragOffsetY = y - letter.y
        lastX = x
        lastY = y
      }
    })
  }

  function moveDrag(x, y) {
    if (!draggedLetter) return
    draggedLetter.x = x - dragOffsetX
    draggedLetter.y = y - dragOffsetY
    draggedLetter.vx = (x - lastX) * 0.5
    draggedLetter.vy = (y - lastY) * 0.5
    lastX = x
    lastY = y
  }

  function endDrag() {
    if (!draggedLetter) return
    draggedLetter.dragging = false
    draggedLetter.element.style.cursor = "grab"
    draggedLetter = null
  }

  document.addEventListener("mousedown", (e) =>
    startDrag(e.clientX, e.clientY),
  )
  document.addEventListener("mousemove", (e) =>
    moveDrag(e.clientX, e.clientY),
  )
  document.addEventListener("mouseup", endDrag)

  document.addEventListener(
    "touchstart",
    (e) => {
      const t = e.touches[0]
      startDrag(t.clientX, t.clientY)
    },
    { passive: true },
  )

  document.addEventListener(
    "touchmove",
    (e) => {
      const t = e.touches[0]
      moveDrag(t.clientX, t.clientY)
    },
    { passive: true },
  )

  document.addEventListener("touchend", endDrag)

  updatePhysics()
}})