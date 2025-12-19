import Item from './Item'

function Grid({ items, selected, onItemClick, shaking }) {
  return (
    <div className={`grid ${shaking ? 'shake' : ''}`}>
      {items.map((item) => (
        <Item
          key={item.text}
          item={item}
          isSelected={selected.some(s => s.text === item.text)}
          onClick={() => onItemClick(item)}
        />
      ))}
    </div>
  )
}

export default Grid
