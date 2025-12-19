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
  const [lives, setLives] = useState(4)
  const [gameOver, setGameOver] = useState(false)
  const [message, setMessage] = useState('')
  const [shaking, setShaking] = useState(false)

  useEffect(() => {
    fetchPuzzle()
  }, [])

  const fetchPuzzle = async () => {
    try {
      const response = await fetch('/api/puzzle')
      const data = await response.json()
      setItems(data.items)
      setGroups(data.groups)
      setSolvedGroups([])
      setSelected([])
      setLives(4)
      setGameOver(false)
      setMessage('')
    } catch (error) {
      console.error('Failed to fetch puzzle:', error)
    }
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

      setShaking(true)
      setTimeout(() => setShaking(false), 500)

      if (maxCount === 3) {
        setMessage('One away...')
      } else {
        setMessage('Incorrect')
      }

      const newLives = lives - 1
      setLives(newLives)

      if (newLives === 0) {
        setGameOver(true)
        setMessage('Game over!')
        // Reveal remaining groups (sorted by difficulty, appended after already-solved)
        const remaining = groups.filter(g => !solvedGroups.find(s => s.name === g.name))
        remaining.sort((a, b) => a.difficulty - b.difficulty)
        setSolvedGroups([...solvedGroups, ...remaining])
        setItems([])
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

      // Check win condition after adding the solved group
      if (solvedGroups.length === 3) {
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
              shaking={shaking}
            />
          )}
        </div>
      </LayoutGroup>

      {message && <p className={`message ${gameOver ? 'game-over' : ''}`}>{message}</p>}

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

      {gameOver && (
        <button className="new-game" onClick={fetchPuzzle}>
          Play Again
        </button>
      )}
    </div>
  )
}

export default App
