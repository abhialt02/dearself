import React, { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Wind } from 'lucide-react'

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'rest'

interface BreathingPattern {
  name: string
  description: string
  pattern: Record<BreathingPhase, number>
  color: string
  benefit: string
}

const breathingPatterns: BreathingPattern[] = [
  {
    name: '4-7-8 Relaxation',
    description: 'Perfect for stress relief and better sleep',
    pattern: { inhale: 4, hold: 7, exhale: 8, rest: 0 },
    color: 'from-pastel-lavender-light to-pastel-lavender',
    benefit: 'Reduces anxiety and promotes relaxation'
  },
  {
    name: 'Box Breathing',
    description: 'Used by Navy SEALs for focus and calm',
    pattern: { inhale: 4, hold: 4, exhale: 4, rest: 4 },
    color: 'from-pastel-purple-light to-pastel-purple',
    benefit: 'Improves focus and reduces stress'
  },
  {
    name: 'Energizing Breath',
    description: 'Quick energy boost for alertness',
    pattern: { inhale: 3, hold: 0, exhale: 3, rest: 0 },
    color: 'from-pastel-pink-light to-pastel-pink',
    benefit: 'Increases energy and mental clarity'
  }
]

export default function Breathe() {
  const [selectedPattern, setSelectedPattern] = useState(breathingPatterns[0])
  const [isActive, setIsActive] = useState(false)
  const [currentPhase, setCurrentPhase] = useState<BreathingPhase>('inhale')
  const [timeLeft, setTimeLeft] = useState(selectedPattern.pattern.inhale)
  const [cycleCount, setCycleCount] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (isActive && timeLeft === 0) {
      // Move to next phase
      const phases: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'rest']
      const currentIndex = phases.indexOf(currentPhase)
      const nextPhase = phases[(currentIndex + 1) % phases.length]
      
      if (nextPhase === 'inhale') {
        setCycleCount(prev => prev + 1)
      }
      
      setCurrentPhase(nextPhase)
      setTimeLeft(selectedPattern.pattern[nextPhase])
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft, currentPhase, selectedPattern])

  const toggleBreathing = () => {
    setIsActive(!isActive)
  }

  const resetBreathing = () => {
    setIsActive(false)
    setCurrentPhase('inhale')
    setTimeLeft(selectedPattern.pattern.inhale)
    setCycleCount(0)
  }

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale': return 'Breathe In'
      case 'hold': return 'Hold'
      case 'exhale': return 'Breathe Out'
      case 'rest': return 'Rest'
    }
  }

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale': return 'from-pastel-pink-light to-pastel-pink'
      case 'hold': return 'from-pastel-purple-light to-pastel-purple'
      case 'exhale': return 'from-pastel-rose-light to-pastel-rose'
      case 'rest': return 'from-pastel-lavender-light to-pastel-lavender'
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep bg-clip-text text-transparent mb-2">
          DearSelf Breathing
        </h1>
        <p className="text-gray-600">Take a moment to center yourself with guided breathing</p>
      </div>

      {/* Pattern Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {breathingPatterns.map((pattern) => (
          <div
            key={pattern.name}
            onClick={() => {
              setSelectedPattern(pattern)
              resetBreathing()
            }}
            className={`p-6 rounded-2xl cursor-pointer transition-all duration-200 ${
              selectedPattern.name === pattern.name
                ? `bg-gradient-to-br ${pattern.color} shadow-lg scale-105`
                : 'bg-white hover:shadow-lg hover:scale-102'
            }`}
          >
            <div className="text-center">
              <Wind className={`h-8 w-8 mx-auto mb-3 ${
                selectedPattern.name === pattern.name ? 'text-white' : 'text-gray-600'
              }`} />
              <h3 className={`font-bold mb-2 ${
                selectedPattern.name === pattern.name ? 'text-white' : 'text-gray-900'
              }`}>
                {pattern.name}
              </h3>
              <p className={`text-sm mb-3 ${
                selectedPattern.name === pattern.name ? 'text-white/90' : 'text-gray-600'
              }`}>
                {pattern.description}
              </p>
              <div className={`inline-block px-3 py-1 rounded-full text-xs ${
                selectedPattern.name === pattern.name 
                  ? 'bg-white/20 text-white' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {pattern.benefit}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Breathing Circle */}
      <div className="flex justify-center">
        <div className="relative">
          <div 
            className={`w-80 h-80 rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center shadow-2xl transition-all duration-1000 ${
              isActive ? 'animate-pulse-soft' : ''
            }`}
            style={{
              transform: currentPhase === 'inhale' ? 'scale(1.1)' : 'scale(1)',
              transition: 'transform 1s ease-in-out'
            }}
          >
            <div className="text-center text-white">
              <p className="text-2xl font-bold mb-2">{getPhaseInstruction()}</p>
              <p className="text-6xl font-light">{timeLeft}</p>
              <p className="text-lg mt-2">Cycle {cycleCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleBreathing}
          className={`flex items-center px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 shadow-lg ${
            isActive
              ? 'bg-gradient-to-r from-pastel-rose-deep to-red-500 hover:from-pastel-rose-dark to-red-400'
              : 'bg-gradient-to-r from-pastel-pink-deep to-pastel-purple-deep hover:from-pastel-pink-dark to-pastel-purple-dark'
          }`}
        >
          {isActive ? (
            <>
              <Pause className="h-5 w-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="h-5 w-5 mr-2" />
              Start
            </>
          )}
        </button>
        
        <button
          onClick={resetBreathing}
          className="flex items-center px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 transition-colors font-medium shadow-lg"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Reset
        </button>
      </div>

      {/* Instructions */}
      <div className="bg-white rounded-2xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">How to Use</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Getting Started</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Choose a breathing pattern that suits your needs</li>
              <li>• Find a comfortable, quiet position</li>
              <li>• Focus on the circle and follow the instructions</li>
              <li>• Breathe naturally and don't force it</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tips for Success</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Practice regularly for best results</li>
              <li>• Start with shorter sessions and build up</li>
              <li>• Use during stressful moments or before sleep</li>
              <li>• Combine with meditation for deeper relaxation</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}