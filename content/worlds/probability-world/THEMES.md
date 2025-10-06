# 🎨 Probability World Themes

This learning content supports multiple themes to make probability concepts more relatable and engaging for different audiences.

## Available Themes

### 🎵 Music Theme (Default)
- **Examples**: Playlists, songs, artists, albums, shuffle play
- **Color**: Pink (#EC4899)
- **Best for**: Music lovers, DJs, playlist curators

### 🎬 Movies Theme  
- **Examples**: Films, scenes, actors, genres, box office
- **Color**: Amber (#F59E0B)
- **Best for**: Film buffs, cinema students, movie critics

### 🎮 Gaming Theme
- **Examples**: Games, levels, achievements, characters, loot drops
- **Color**: Emerald (#10B981)
- **Best for**: Gamers, game developers, esports enthusiasts

### ☕ Coffee Theme
- **Examples**: Blends, roasts, brewing methods, cafes, barista choices
- **Color**: Brown (#92400E)
- **Best for**: Coffee enthusiasts, baristas, cafe owners

### 👟 Sneakers Theme
- **Examples**: Brands, models, releases, collections, raffles
- **Color**: Violet (#7C3AED)
- **Best for**: Sneakerheads, collectors, fashion enthusiasts

### ⚽ Sports Theme
- **Examples**: Teams, players, matches, tournaments, draft picks
- **Color**: Blue (#3B82F6)
- **Best for**: Sports fans, athletes, fantasy sports players

### 🍕 Food Theme
- **Examples**: Recipes, ingredients, cuisines, restaurants, menu items
- **Color**: Red (#EF4444)
- **Best for**: Foodies, chefs, restaurant owners

## How to Use Themes

### Method 1: Command Line
```bash
cd stats-learning-backend
python scripts/seed.py gaming  # Seeds with gaming theme
```

### Method 2: PowerShell Script
```powershell
.\seed_with_theme.ps1 -Theme movies
```

### Method 3: Preview Themes
```bash
cd stats-learning-backend
python scripts/preview_themes.py coffee  # Preview coffee theme
python scripts/preview_themes.py all     # Preview all themes
```

## How Themes Work

1. **Content Templates**: All lesson content contains `{{THEME}}` placeholders
2. **Dynamic Replacement**: When seeding, these placeholders are replaced with theme-specific terms
3. **Visual Customization**: Each theme has its own icon and color scheme
4. **Contextual Examples**: Problems and simulations adapt to the chosen theme

## Example Transformations

**Original Template**:
> "Shuffle" your {{THEME}} playlist. Probability is a number from 0 to 1...

**Music Theme**:
> "Shuffle" your music playlist. Probability is a number from 0 to 1...

**Gaming Theme**:
> "Shuffle" your gaming playlist. Probability is a number from 0 to 1...

**Coffee Theme**:
> "Shuffle" your coffee playlist. Probability is a number from 0 to 1...

## Creating Custom Themes

To add a new theme:

1. Edit `stats-learning-backend/scripts/seed.py`
2. Add your theme to the `theme_config` dictionary:
```python
"astronomy": {"icon": "🌟", "color": "#4B5563", "desc": "space examples"},
```
3. Add it to the valid themes list
4. Consider the context where {{THEME}} appears and ensure it makes sense

## Best Practices

- Choose a theme that resonates with your target audience
- Ensure examples remain mathematically accurate regardless of theme
- Test the content flow with your chosen theme
- Consider cultural relevance and accessibility

## Theme Impact

Themes affect:
- ✅ Lesson examples and scenarios
- ✅ Quiz question contexts
- ✅ World icons and colors
- ✅ Simulation configurations
- ❌ Core mathematical concepts (unchanged)
- ❌ Learning objectives (unchanged)
- ❌ Difficulty progression (unchanged)
