import { useState, useEffect } from 'react'
import { LayoutGroup, AnimatePresence } from 'framer-motion'
import Grid from './components/Grid'
import SolvedGroup from './components/SolvedGroup'
import TransitioningGroup from './components/TransitioningGroup'
import Lives from './components/Lives'

function App() {
  const [items, setItems] = useState([])
  const [groups, setGroups] = useState([])
  const [selected, setSelected] = useState([])
  const [solvedGroups, setSolvedGroups] = useState([])
  const [transitioningGroup, setTransitioningGroup] = useState(null)
  const [revealQueue, setRevealQueue] = useState([])
  const [lives, setLives] = useState(4)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState('')
  const [shakingItems, setShakingItems] = useState([])
  const [showOneAway, setShowOneAway] = useState(false)
  const [puzzleIndex, setPuzzleIndex] = useState(1)
  const [totalPuzzles, setTotalPuzzles] = useState(1)

  useEffect(() => {
    fetchPuzzle(1)
  }, [])

  // Process reveal queue one at a time
  useEffect(() => {
    if (revealQueue.length > 0 && !transitioningGroup) {
      const [nextGroup, ...remaining] = revealQueue
      setRevealQueue(remaining)
      setTransitioningGroup(nextGroup)
      setItems(prev => prev.filter(item => item.groupId !== nextGroup.name))
    }
  }, [revealQueue, transitioningGroup])

  const fetchPuzzle = async (index) => {
    try {
      const response = await fetch(`/api/puzzle/${index}`)
      const data = await response.json()
      setItems(data.items)
      setGroups(data.groups)
      setPuzzleIndex(data.puzzleIndex)
      setTotalPuzzles(data.totalPuzzles)
      setSolvedGroups([])
      setSelected([])
      setRevealQueue([])
      setTransitioningGroup(null)
      setLives(4)
      setGameOver(false)
      setMessage('')
    } catch (error) {
      console.error('Failed to fetch puzzle:', error)
    }
  }

  const handleNextPuzzle = () => {
    if (puzzleIndex < totalPuzzles) {
      fetchPuzzle(puzzleIndex + 1)
    }
  }

  const handlePlayAgain = () => {
    fetchPuzzle(puzzleIndex)
  }

  const handleItemClick = (item) => {
    if (gameOver || transitioningGroup) return

    if (selected.find(s => s.text === item.text)) {
      setSelected(selected.filter(s => s.text !== item.text))
    } else if (selected.length < 4) {
      setSelected([...selected, item])
    }
  }

  const handleSubmit = () => {
    if (selected.length !== 4 || gameOver) return

    const groupId = selected[0].groupId
    const allMatch = selected.every(item => item.groupId === groupId)

    if (allMatch) {
      const solvedGroup = groups.find(g => g.name === groupId)
      // Start the transition animation
      setTransitioningGroup(solvedGroup)
      setItems(items.filter(item => item.groupId !== groupId))
      setSelected([])
      setMessage('')
    } else {
      // Check how many are correct
      const groupCounts = {}
      selected.forEach(item => {
        groupCounts[item.groupId] = (groupCounts[item.groupId] || 0) + 1
      })
      const maxCount = Math.max(...Object.values(groupCounts))

      // Shake only selected items
      setShakingItems(selected.map(s => s.text))
      setTimeout(() => setShakingItems([]), 500)

      if (maxCount === 3) {
        setShowOneAway(true)
        setTimeout(() => setShowOneAway(false), 1500)
      }

      const newLives = lives - 1
      setLives(newLives)

      if (newLives === 0) {
        setGameOver(true)
        setMessage('Game over!')
        // Queue remaining groups for animated reveal (sorted by difficulty)
        const remaining = groups.filter(g => !solvedGroups.find(s => s.name === g.name))
        remaining.sort((a, b) => a.difficulty - b.difficulty)
        setRevealQueue(remaining)
      }

      setSelected([])
    }
  }

  const handleShuffle = () => {
    const shuffled = [...items]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setItems(shuffled)
  }

  const handleDeselectAll = () => {
    setSelected([])
  }

  const handleTransitionComplete = () => {
    if (transitioningGroup) {
      setSolvedGroups(prev => [...prev, transitioningGroup])
      setTransitioningGroup(null)

      // Check win condition after adding the solved group (only if not already game over from losing)
      if (solvedGroups.length === 3 && !gameOver) {
        setGameOver(true)
        setMessage('You won!')
      }
    }
  }

  return (
    <div className="app">
      <h1>Connections</h1>
      <p className="subtitle">Create four groups of four!</p>

      <LayoutGroup>
        <div className="game-container">
          {solvedGroups.map(group => (
            <SolvedGroup key={group.name} group={group} />
          ))}

          {transitioningGroup && (
            <TransitioningGroup
              group={transitioningGroup}
              onComplete={handleTransitionComplete}
            />
          )}

          {items.length > 0 && (
            <Grid
              items={items}
              selected={selected}
              onItemClick={handleItemClick}
              shakingItems={shakingItems}
            />
          )}
        </div>
      </LayoutGroup>

      {gameOver && message && <p className="message game-over">{message}</p>}

      <div className={`one-away-toast ${showOneAway ? 'visible' : ''}`}>
        One away...
      </div>

      <Lives lives={lives} />

      <div className="buttons">
        <button onClick={handleShuffle} disabled={gameOver || transitioningGroup}>
          Shuffle
        </button>
        <button onClick={handleDeselectAll} disabled={selected.length === 0 || gameOver}>
          Deselect All
        </button>
        <button
          onClick={handleSubmit}
          disabled={selected.length !== 4 || gameOver || transitioningGroup}
          className="submit"
        >
          Submit
        </button>
      </div>

      {gameOver && revealQueue.length === 0 && !transitioningGroup && (
        <div className="game-over-buttons">
          <button className="new-game" onClick={handlePlayAgain}>
            Play Again
          </button>
          {puzzleIndex < totalPuzzles && (
            <button className="next-puzzle" onClick={handleNextPuzzle}>
              Next Puzzle
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default App
