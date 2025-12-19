import { motion } from 'framer-motion'
import Item from './Item'

function Grid({ items, selected, onItemClick, shaking }) {
  return (
    <motion.div
      className={`grid ${shaking ? 'shake' : ''}`}
      layout
    >
      {items.map((item) => (
        <Item
          key={item.text}
          item={item}
          isSelected={selected.some(s => s.text === item.text)}
          onClick={() => onItemClick(item)}
        />
      ))}
    </motion.div>
  )
}

export default Grid
