# PowerShell script to seed database with themed content

param(
    [Parameter(Position=0)]
    [ValidateSet("music", "movies", "gaming", "coffee", "sneakers", "sports", "food")]
    [string]$Theme = "music"
)

Write-Host "`n🎲 PROBABILITY WORLD THEME SEEDER" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

$themeDescriptions = @{
    "music" = "🎵 Musical examples (playlists, songs, artists)"
    "movies" = "🎬 Cinema examples (films, scenes, actors)"
    "gaming" = "🎮 Gaming examples (games, levels, achievements)"
    "coffee" = "☕ Coffee examples (blends, roasts, brewing)"
    "sneakers" = "👟 Sneaker examples (brands, models, releases)"
    "sports" = "⚽ Sports examples (teams, players, matches)"
    "food" = "🍕 Food examples (recipes, ingredients, cuisines)"
}

Write-Host "`nSelected Theme: " -NoNewline
Write-Host $Theme.ToUpper() -ForegroundColor Yellow
Write-Host $themeDescriptions[$Theme] -ForegroundColor Gray

Write-Host "`nThis will:" -ForegroundColor White
Write-Host "  1. Create/update Probability World with $Theme theme" -ForegroundColor Gray
Write-Host "  2. Replace all {{THEME}} placeholders with '$Theme'" -ForegroundColor Gray
Write-Host "  3. Add themed icons and colors" -ForegroundColor Gray
Write-Host "  4. Generate 8 topics with 40+ quiz questions" -ForegroundColor Gray

$confirm = Read-Host "`nProceed? (Y/N)"
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "Cancelled." -ForegroundColor Red
    exit
}

# Navigate to backend directory
Set-Location -Path "stats-learning-backend"

Write-Host "`n📦 Installing dependencies..." -ForegroundColor Yellow
pip install -e .

Write-Host "`n🌱 Seeding database with $Theme theme..." -ForegroundColor Yellow
python scripts/seed.py $Theme

Write-Host "`n✅ Done! Your Probability World is now $Theme-themed!" -ForegroundColor Green
Write-Host "`nTo try a different theme, run:" -ForegroundColor Gray
Write-Host "  .\seed_with_theme.ps1 -Theme theme_name" -ForegroundColor White
Write-Host "`nAvailable themes: music, movies, gaming, coffee, sneakers, sports, food" -ForegroundColor Gray

# Return to original directory
Set-Location -Path ".."
