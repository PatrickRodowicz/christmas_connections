import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

function TransitioningGroup({ group, onComplete }) {
  const [showResult, setShowResult] = useState(false)

  const difficultyColors = {
    1: '#f9df6d',
    2: '#a0c35a',
    3: '#b0c4ef',
    4: '#ba81c5'
  }

  useEffect(() => {
    // Wait for tiles to fly into position, then show the merged result
    const timer = setTimeout(() => {
      setShowResult(true)
    }, 350)

    // Complete the transition after showing result
    const completeTimer = setTimeout(() => {
      onComplete()
    }, 700)

    return () => {
      clearTimeout(timer)
      clearTimeout(completeTimer)
    }
  }, [onComplete])

  if (showResult) {
    return (
      <motion.div
        className={`solved-group`}
        style={{ backgroundColor: difficultyColors[group.difficulty] }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <div className="group-name">{group.name}</div>
        <div className="group-items">{group.items.join(', ')}</div>
      </motion.div>
    )
  }

  return (
    <div className="transitioning-tiles">
      {group.items.map((item) => (
        <motion.div
          key={item}
          layoutId={item}
          className="transitioning-tile"
          style={{ backgroundColor: difficultyColors[group.difficulty] }}
          transition={{
            layout: { type: 'spring', stiffness: 400, damping: 30 },
          }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  )
}

export default TransitioningGroup
