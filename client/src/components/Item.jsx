import { motion } from 'framer-motion'

function Item({ item, isSelected, isShaking, onClick }) {
  return (
    <motion.button
      layout
      layoutId={item.text}
      className={`item ${isSelected ? 'selected' : ''} ${isShaking ? 'shake' : ''}`}
      onClick={onClick}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      {item.text}
    </motion.button>
  )
}

export default Item
