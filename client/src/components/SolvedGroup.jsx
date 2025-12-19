function SolvedGroup({ group }) {
  const difficultyColors = {
    1: 'yellow',
    2: 'green',
    3: 'blue',
    4: 'purple'
  }

  return (
    <div className={`solved-group ${difficultyColors[group.difficulty]}`}>
      <div className="group-name">{group.name}</div>
      <div className="group-items">{group.items.join(', ')}</div>
    </div>
  )
}

export default SolvedGroup
