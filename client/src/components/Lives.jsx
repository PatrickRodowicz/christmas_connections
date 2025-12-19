function Lives({ lives }) {
  return (
    <div className="lives">
      <span>Mistakes remaining: </span>
      <div className="dots">
        {[...Array(4)].map((_, i) => (
          <span
            key={i}
            className={`dot ${i < lives ? 'active' : ''}`}
          />
        ))}
      </div>
    </div>
  )
}

export default Lives
