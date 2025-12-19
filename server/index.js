const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve static files from client build
app.use(express.static(path.join(__dirname, '../client/dist')));

// Count available puzzles
const puzzlesDir = path.join(__dirname, 'puzzles');
const getPuzzleCount = () => {
  const files = fs.readdirSync(puzzlesDir);
  return files.filter(f => f.match(/^puzzle\d+\.json$/)).length;
};

// API endpoint to get puzzle count
app.get('/api/puzzles/count', (req, res) => {
  res.json({ count: getPuzzleCount() });
});

// Helper to load and return puzzle data
const loadPuzzle = (index, res) => {
  try {
    const puzzlePath = path.join(__dirname, `puzzles/puzzle${index}.json`);

    if (!fs.existsSync(puzzlePath)) {
      return res.status(404).json({ error: 'Puzzle not found' });
    }

    const puzzleData = JSON.parse(fs.readFileSync(puzzlePath, 'utf8'));

    // Shuffle the items for the frontend
    const allItems = puzzleData.groups.flatMap(group =>
      group.items.map(item => ({
        text: item,
        groupId: group.name,
        difficulty: group.difficulty
      }))
    );

    // Fisher-Yates shuffle
    for (let i = allItems.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allItems[i], allItems[j]] = [allItems[j], allItems[i]];
    }

    res.json({
      puzzleIndex: index,
      totalPuzzles: getPuzzleCount(),
      items: allItems,
      groups: puzzleData.groups.map(g => ({
        name: g.name,
        difficulty: g.difficulty,
        items: g.items
      }))
    });
  } catch (error) {
    console.error('Error loading puzzle:', error);
    res.status(500).json({ error: 'Failed to load puzzle' });
  }
};

// API endpoint to get puzzle by index
app.get('/api/puzzle/:index', (req, res) => {
  const index = parseInt(req.params.index) || 1;
  loadPuzzle(index, res);
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Access on local network via your machine's IP address`);
});
