function Item({ item, isSelected, onClick }) {
  return (
    <button
      className={`item ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      {item.text}
    </button>
  )
}

export default Item
