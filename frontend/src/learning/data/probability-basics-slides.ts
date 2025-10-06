/**
 * Probability Basics Lesson Slides
 * 
 * 15 engaging slides that break down probability concepts into digestible chunks
 */

import type { DuolingoSlide } from '../ui/DuolingoLessonViewer';

export const probabilityBasicsSlides: DuolingoSlide[] = [
  // Slide 1: Welcome/Intro
  {
    id: "slide-1-intro",
    type: "intro",
    visual: "🎲",
    title: "Welcome to Probability!",
    content: `
      <p class='text-xl mb-6'>Think of probability as your <strong>prediction superpower</strong> 🦸‍♂️</p>
      <p class='text-lg text-gray-600 mb-4'>It measures how likely something is to happen, on a scale from 0 to 1.</p>
      <div class='bg-blue-50 p-4 rounded-lg'>
        <p class='text-blue-800'><strong>0</strong> = Impossible • <strong>0.5</strong> = 50-50 chance • <strong>1</strong> = Guaranteed</p>
      </div>
    `,
    highlight: "Probability helps you make better predictions about uncertain events"
  },

  // Slide 2: Probability Scale
  {
    id: "slide-2-scale",
    type: "concept",
    visual: "📏",
    title: "The Probability Scale",
    content: `
      <div class='text-center mb-6'>
        <div class='bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-8 rounded-full mb-4 relative'>
          <div class='absolute left-0 top-10 text-sm font-bold'>0.0<br/>🔴 IMPOSSIBLE</div>
          <div class='absolute left-1/2 transform -translate-x-1/2 top-10 text-sm font-bold'>0.5<br/>🟨 50-50</div>
          <div class='absolute right-0 top-10 text-sm font-bold'>1.0<br/>🟢 CERTAIN</div>
        </div>
      </div>
      <div class='grid grid-cols-1 md:grid-cols-3 gap-4 mt-16'>
        <div class='text-center p-4 bg-red-50 rounded-lg'>
          <p class='font-bold text-red-700'>0.0 = Never happens</p>
          <p class='text-sm text-red-600'>Finding a unicorn 🦄</p>
        </div>
        <div class='text-center p-4 bg-yellow-50 rounded-lg'>
          <p class='font-bold text-yellow-700'>0.5 = Coin flip</p>
          <p class='text-sm text-yellow-600'>Heads or tails 🪙</p>
        </div>
        <div class='text-center p-4 bg-green-50 rounded-lg'>
          <p class='font-bold text-green-700'>1.0 = Always happens</p>
          <p class='text-sm text-green-600'>Sun rises tomorrow ☀️</p>
        </div>
      </div>
    `,
    highlight: "All probabilities must be between 0 and 1 (inclusive)"
  },

  // Slide 3: Spotify Example
  {
    id: "slide-3-spotify",
    type: "example",
    visual: "🎵",
    title: "Your Spotify Playlist",
    content: `
      <p class='text-lg mb-6'>You've got <strong>20 songs</strong> in your "Study Vibes" playlist:</p>
      <div class='grid grid-cols-2 gap-4 mb-6'>
        <div class='bg-pink-50 p-4 rounded-lg text-center'>
          <p class='text-2xl mb-2'>🎸</p>
          <p class='font-bold'>8 Rock songs</p>
        </div>
        <div class='bg-blue-50 p-4 rounded-lg text-center'>
          <p class='text-2xl mb-2'>🎹</p>
          <p class='font-bold'>7 Lo-fi beats</p>
        </div>
        <div class='bg-purple-50 p-4 rounded-lg text-center'>
          <p class='text-2xl mb-2'>🎤</p>
          <p class='font-bold'>3 Indie songs</p>
        </div>
        <div class='bg-yellow-50 p-4 rounded-lg text-center'>
          <p class='text-2xl mb-2'>🎵</p>
          <p class='font-bold'>2 Classical</p>
        </div>
      </div>
      <p class='text-lg'>You hit <strong>shuffle</strong>. What's the probability your next song is rock?</p>
      <div class='bg-green-100 p-4 rounded-lg mt-4'>
        <p class='text-green-800 font-bold text-xl'>P(rock) = 8/20 = 0.4 = 40% 🎸</p>
      </div>
    `,
    highlight: "This is Classical Probability: favorable outcomes ÷ total outcomes"
  },

  // Slide 4: Key Terms
  {
    id: "slide-4-terms",
    type: "concept",
    visual: "📚",
    title: "Essential Vocabulary",
    content: `
      <div class='space-y-6'>
        <div class='bg-blue-50 p-6 rounded-xl border-l-4 border-blue-400'>
          <p class='font-bold text-blue-800 text-xl mb-2'>🔬 Experiment</p>
          <p class='text-blue-700'>The process you're doing (hitting shuffle once)</p>
        </div>
        
        <div class='bg-purple-50 p-6 rounded-xl border-l-4 border-purple-400'>
          <p class='font-bold text-purple-800 text-xl mb-2'>🌌 Sample Space (S)</p>
          <p class='text-purple-700'>All possible outcomes (all 20 songs in your playlist)</p>
        </div>
        
        <div class='bg-green-50 p-6 rounded-xl border-l-4 border-green-400'>
          <p class='font-bold text-green-800 text-xl mb-2'>🎯 Event</p>
          <p class='text-green-700'>What you care about (getting a rock song)</p>
        </div>
      </div>
    `,
    highlight: "These three terms form the foundation of all probability problems"
  },

  // Slide 5: Classical Probability Definition
  {
    id: "slide-5-classical",
    type: "concept",
    visual: "🧮",
    title: "Classical Probability",
    content: `
      <p class='text-xl mb-6'><strong>When all outcomes are equally likely</strong></p>
      <div class='bg-gradient-to-r from-blue-100 to-purple-100 p-8 rounded-2xl mb-6'>
        <p class='text-3xl font-bold text-center mb-4'>P(Event) = <span class='text-blue-600'>Favorable</span> ÷ <span class='text-purple-600'>Total</span></p>
      </div>
      <div class='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div class='text-center'>
          <p class='text-lg font-semibold text-blue-600 mb-2'>Favorable Outcomes</p>
          <p class='text-gray-600'>Ways your event can happen</p>
        </div>
        <div class='text-center'>
          <p class='text-lg font-semibold text-purple-600 mb-2'>Total Outcomes</p>
          <p class='text-gray-600'>All possible things that could happen</p>
        </div>
      </div>
    `,
    highlight: "Use this when all outcomes have an equal chance of happening"
  },

  // Slide 6: Die Rolling Example
  {
    id: "slide-6-die",
    type: "example",
    visual: "🎲",
    title: "Rolling a Fair Die",
    content: `
      <p class='text-lg mb-6'>You roll a standard 6-sided die. What's P(rolling a 4)?</p>
      <div class='bg-white border-2 border-gray-200 p-6 rounded-xl mb-6'>
        <div class='grid grid-cols-6 gap-2 mb-4'>
          <div class='bg-gray-100 p-4 rounded text-center font-bold'>1</div>
          <div class='bg-gray-100 p-4 rounded text-center font-bold'>2</div>
          <div class='bg-gray-100 p-4 rounded text-center font-bold'>3</div>
          <div class='bg-green-200 p-4 rounded text-center font-bold text-green-800'>4 ✓</div>
          <div class='bg-gray-100 p-4 rounded text-center font-bold'>5</div>
          <div class='bg-gray-100 p-4 rounded text-center font-bold'>6</div>
        </div>
        <p class='text-center text-gray-600'>6 total outcomes, 1 favorable outcome</p>
      </div>
      <div class='bg-green-100 p-4 rounded-lg'>
        <p class='text-green-800 font-bold text-xl text-center'>P(4) = 1/6 ≈ 0.167 = 16.7% 🎯</p>
      </div>
    `,
    highlight: "Each side of a fair die has an equal 1/6 chance"
  },

  // Slide 7: Empirical Probability Definition
  {
    id: "slide-7-empirical",
    type: "concept",
    visual: "📊",
    title: "Empirical Probability",
    content: `
      <p class='text-xl mb-6'><strong>Based on real data from experiments</strong></p>
      <div class='bg-gradient-to-r from-green-100 to-blue-100 p-8 rounded-2xl mb-6'>
        <p class='text-3xl font-bold text-center mb-4'>P(Event) = <span class='text-green-600'>Times it happened</span> ÷ <span class='text-blue-600'>Total trials</span></p>
      </div>
      <div class='bg-yellow-50 p-6 rounded-xl'>
        <p class='text-yellow-800 text-lg'><strong>When to use:</strong> You have actual data from observations or experiments</p>
        <p class='text-yellow-700 mt-2'>Example: "It rained 15 days out of the last 50 days"</p>
      </div>
    `,
    highlight: "Real data beats guessing every time!"
  },

  // Slide 8: Phone Notifications Example
  {
    id: "slide-8-phone",
    type: "example",
    visual: "📱",
    title: "Phone Notifications",
    content: `
      <p class='text-lg mb-6'>You tracked your phone for a week:</p>
      <div class='bg-gray-50 p-6 rounded-xl mb-6'>
        <div class='grid grid-cols-2 gap-6 text-center'>
          <div>
            <p class='text-3xl font-bold text-blue-600 mb-2'>50</p>
            <p class='text-gray-600'>Times you checked</p>
          </div>
          <div>
            <p class='text-3xl font-bold text-green-600 mb-2'>15</p>
            <p class='text-gray-600'>Had new notifications</p>
          </div>
        </div>
      </div>
      <p class='text-lg mb-4'>What's P(notification when you check)?</p>
      <div class='bg-green-100 p-4 rounded-lg'>
        <p class='text-green-800 font-bold text-xl text-center'>P(notification) = 15/50 = 0.30 = 30% 📲</p>
      </div>
    `,
    highlight: "This empirical data predicts your future phone checking experience"
  },

  // Slide 9: Subjective Probability
  {
    id: "slide-9-subjective",
    type: "concept",
    visual: "🧠",
    title: "Subjective Probability",
    content: `
      <p class='text-xl mb-6'><strong>Your educated guess when data is limited</strong></p>
      <div class='space-y-4 mb-6'>
        <div class='bg-purple-50 p-4 rounded-lg'>
          <p class='text-purple-800'>"I think there's a <strong>70% chance</strong> I'll like this new movie" 🎬</p>
        </div>
        <div class='bg-blue-50 p-4 rounded-lg'>
          <p class='text-blue-800'>"My team has an <strong>85% chance</strong> of winning" ⚽</p>
        </div>
        <div class='bg-green-50 p-4 rounded-lg'>
          <p class='text-green-800'>"There's probably a <strong>60% chance</strong> I'll finish this tonight" 📚</p>
        </div>
      </div>
      <div class='bg-amber-50 p-4 rounded-lg border border-amber-200'>
        <p class='text-amber-800'><strong>⚠️ Warning:</strong> These can be biased! Use real data when possible.</p>
      </div>
    `,
    highlight: "Personal beliefs based on experience and judgment"
  },

  // Slide 10: Complement Rule
  {
    id: "slide-10-complement",
    type: "concept",
    visual: "⚖️",
    title: "The Complement Rule",
    content: `
      <p class='text-xl mb-6'>Sometimes it's easier to calculate what <strong>WON'T</strong> happen!</p>
      <div class='bg-gradient-to-r from-red-100 to-green-100 p-8 rounded-2xl mb-6'>
        <p class='text-3xl font-bold text-center mb-4'>P(NOT A) = 1 - P(A)</p>
      </div>
      <div class='bg-blue-50 p-6 rounded-xl'>
        <p class='text-blue-800 text-lg mb-2'><strong>Example:</strong> Weather forecast</p>
        <div class='flex items-center justify-center gap-8'>
          <div class='text-center'>
            <p class='text-2xl mb-2'>🌧️</p>
            <p class='font-bold'>P(rain) = 0.3</p>
          </div>
          <div class='text-2xl'>→</div>
          <div class='text-center'>
            <p class='text-2xl mb-2'>☀️</p>
            <p class='font-bold'>P(no rain) = 1 - 0.3 = 0.7</p>
          </div>
        </div>
      </div>
    `,
    highlight: "The probability of something NOT happening = 1 minus the probability it DOES happen"
  },

  // Slide 11: Coffee Shop Example
  {
    id: "slide-11-coffee",
    type: "example",
    visual: "☕",
    title: "Coffee Shop Orders",
    content: `
      <p class='text-lg mb-6'>Your local coffee shop messes up orders <strong>8% of the time</strong>.</p>
      <p class='text-lg mb-6'>What's the probability they get your order <strong>right</strong>?</p>
      <div class='bg-amber-50 p-6 rounded-xl mb-6'>
        <p class='text-amber-800 text-lg mb-4'><strong>Think:</strong> Instead of calculating P(correct), use the complement!</p>
        <div class='bg-white p-4 rounded-lg'>
          <p class='font-mono text-lg'>P(wrong) = 0.08</p>
          <p class='font-mono text-lg'>P(correct) = 1 - 0.08 = 0.92</p>
        </div>
      </div>
      <div class='bg-green-100 p-4 rounded-lg'>
        <p class='text-green-800 font-bold text-xl text-center'>92% chance of getting the right drink! ✅</p>
      </div>
    `,
    highlight: "Complement rule makes some calculations much easier"
  },

  // Slide 12: Law of Large Numbers
  {
    id: "slide-12-lln",
    type: "concept",
    visual: "📈",
    title: "Law of Large Numbers",
    content: `
      <p class='text-xl mb-6'><strong>More trials = More accurate predictions</strong></p>
      <div class='overflow-x-auto'>
        <table class='w-full bg-white rounded-lg shadow-sm'>
          <thead class='bg-gray-50'>
            <tr>
              <th class='p-3 text-left'>Coin Flips</th>
              <th class='p-3 text-left'>Heads</th>
              <th class='p-3 text-left'>% Heads</th>
              <th class='p-3 text-left'>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            <tr class='border-t'>
              <td class='p-3 font-bold'>10</td>
              <td class='p-3'>7</td>
              <td class='p-3'>70%</td>
              <td class='p-3'>😵 Way off!</td>
            </tr>
            <tr class='border-t'>
              <td class='p-3 font-bold'>100</td>
              <td class='p-3'>47</td>
              <td class='p-3'>47%</td>
              <td class='p-3'>🤔 Getting closer</td>
            </tr>
            <tr class='border-t'>
              <td class='p-3 font-bold'>1,000</td>
              <td class='p-3'>503</td>
              <td class='p-3'>50.3%</td>
              <td class='p-3'>🎯 Very close!</td>
            </tr>
          </tbody>
        </table>
      </div>
    `,
    highlight: "Don't trust small samples—you need more data for reliable predictions"
  },

  // Slide 13: The Golden Rules
  {
    id: "slide-13-rules",
    type: "concept",
    visual: "🏆",
    title: "The 3 Golden Rules",
    content: `
      <div class='space-y-6'>
        <div class='bg-yellow-50 p-6 rounded-xl border-2 border-yellow-300'>
          <p class='font-bold text-yellow-800 text-xl mb-2'>Rule #1: Stay in Range</p>
          <p class='text-yellow-700 text-lg'>0 ≤ P(Event) ≤ 1</p>
          <p class='text-yellow-600'>✅ Valid: 0.5, 0.75, 0, 1 • ❌ Invalid: 1.5, -0.2</p>
        </div>
        
        <div class='bg-green-50 p-6 rounded-xl border-2 border-green-300'>
          <p class='font-bold text-green-800 text-xl mb-2'>Rule #2: Everything Adds Up</p>
          <p class='text-green-700 text-lg'>All probabilities sum to 1</p>
          <p class='text-green-600'>Like splitting a pizza—all slices = one whole pizza!</p>
        </div>
        
        <div class='bg-blue-50 p-6 rounded-xl border-2 border-blue-300'>
          <p class='font-bold text-blue-800 text-xl mb-2'>Rule #3: Complement Rule</p>
          <p class='text-blue-700 text-lg'>P(NOT A) = 1 - P(A)</p>
          <p class='text-blue-600'>Sometimes calculating the opposite is easier!</p>
        </div>
      </div>
    `,
    highlight: "These rules NEVER break—memorize them!"
  },

  // Slide 14: Pro Tips
  {
    id: "slide-14-tips",
    type: "tip",
    visual: "💡",
    title: "Pro Tips for Success",
    content: `
      <div class='space-y-4'>
        <div class='bg-green-50 p-4 rounded-lg flex items-start gap-3'>
          <span class='text-2xl'>✅</span>
          <div>
            <p class='font-bold text-green-800'>Sanity Check</p>
            <p class='text-green-700'>Always verify your answer is between 0 and 1</p>
          </div>
        </div>
        
        <div class='bg-blue-50 p-4 rounded-lg flex items-start gap-3'>
          <span class='text-2xl'>🔄</span>
          <div>
            <p class='font-bold text-blue-800'>Use Complements</p>
            <p class='text-blue-700'>Sometimes P(NOT A) is easier to calculate than P(A)</p>
          </div>
        </div>
        
        <div class='bg-purple-50 p-4 rounded-lg flex items-start gap-3'>
          <span class='text-2xl'>🎯</span>
          <div>
            <p class='font-bold text-purple-800'>Think "Favorable over Total"</p>
            <p class='text-purple-700'>For classical probability, count favorable outcomes ÷ total outcomes</p>
          </div>
        </div>
        
        <div class='bg-orange-50 p-4 rounded-lg flex items-start gap-3'>
          <span class='text-2xl'>📊</span>
          <div>
            <p class='font-bold text-orange-800'>More Data = Better Estimates</p>
            <p class='text-orange-700'>Larger samples give more reliable empirical probabilities</p>
          </div>
        </div>
      </div>
    `,
    highlight: "Master these tips and you'll ace any probability problem!"
  },

  // Slide 13: Gaming Probability
  {
    id: "slide-13-gaming",
    type: "example",
    visual: "🎮",
    title: "Video Game Loot Drops",
    content: `
      <p class='text-lg mb-6'>In your favorite RPG, treasure chests contain:</p>
      <div class='space-y-3 mb-6'>
        <div class='bg-gray-100 p-4 rounded-lg flex justify-between items-center'>
          <span class='font-bold'>Common items</span>
          <span class='bg-gray-500 text-white px-3 py-1 rounded-full'>70%</span>
        </div>
        <div class='bg-blue-100 p-4 rounded-lg flex justify-between items-center'>
          <span class='font-bold'>Rare items</span>
          <span class='bg-blue-500 text-white px-3 py-1 rounded-full'>20%</span>
        </div>
        <div class='bg-purple-100 p-4 rounded-lg flex justify-between items-center'>
          <span class='font-bold'>Epic items</span>
          <span class='bg-purple-500 text-white px-3 py-1 rounded-full'>8%</span>
        </div>
        <div class='bg-yellow-100 p-4 rounded-lg flex justify-between items-center'>
          <span class='font-bold'>Legendary items</span>
          <span class='bg-yellow-500 text-white px-3 py-1 rounded-full'>2%</span>
        </div>
      </div>
      <p class='text-lg mb-4'>What's P(getting at least a Rare item)?</p>
      <div class='bg-green-100 p-4 rounded-lg'>
        <p class='text-green-800 font-bold text-xl text-center'>P(Rare or better) = 20% + 8% + 2% = 30% ⚔️</p>
      </div>
    `,
    highlight: "Add up probabilities when events can't happen at the same time"
  },

  // Slide 14: Real-World Applications
  {
    id: "slide-14-applications",
    type: "practice",
    visual: "🌍",
    title: "Probability Everywhere!",
    content: `
      <p class='text-xl mb-6'>Once you master probability, you'll see it <strong>everywhere</strong>:</p>
      <div class='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div class='space-y-3'>
          <div class='bg-green-50 p-4 rounded-lg'>
            <p class='text-green-800'><strong>🏀 Sports:</strong> "85% free throw shooter"</p>
          </div>
          <div class='bg-blue-50 p-4 rounded-lg'>
            <p class='text-blue-800'><strong>🌤️ Weather:</strong> "30% chance of rain"</p>
          </div>
          <div class='bg-purple-50 p-4 rounded-lg'>
            <p class='text-purple-800'><strong>💊 Medicine:</strong> "95% success rate"</p>
          </div>
        </div>
        <div class='space-y-3'>
          <div class='bg-orange-50 p-4 rounded-lg'>
            <p class='text-orange-800'><strong>📱 Tech:</strong> "99.9% uptime"</p>
          </div>
          <div class='bg-pink-50 p-4 rounded-lg'>
            <p class='text-pink-800'><strong>📈 Business:</strong> "70% customer return rate"</p>
          </div>
          <div class='bg-yellow-50 p-4 rounded-lg'>
            <p class='text-yellow-800'><strong>🎓 Education:</strong> "80% pass rate"</p>
          </div>
        </div>
      </div>
    `,
    highlight: "Probability is the language of uncertainty in our data-driven world"
  },

  // Slide 15: Completion/Celebration
  {
    id: "slide-15-complete",
    type: "intro",
    visual: "🎉",
    title: "You Did It!",
    content: `
      <div class='text-center space-y-6'>
        <p class='text-2xl font-bold text-gray-800 mb-4'>Congratulations! 🎊</p>
        <p class='text-xl text-gray-600 mb-6'>You now understand the fundamentals of probability!</p>
        
        <div class='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div class='bg-green-50 p-4 rounded-lg'>
            <p class='text-green-800 font-bold mb-2'>✅ What You Learned</p>
            <ul class='text-green-700 text-left space-y-1'>
              <li>• Probability scale (0-1)</li>
              <li>• Three types of probability</li>
              <li>• The golden rules</li>
              <li>• Complement rule</li>
              <li>• Law of Large Numbers</li>
            </ul>
          </div>
          
          <div class='bg-blue-50 p-4 rounded-lg'>
            <p class='text-blue-800 font-bold mb-2'>🚀 What's Next</p>
            <ul class='text-blue-700 text-left space-y-1'>
              <li>• Review the summary</li>
              <li>• Take the quiz</li>
              <li>• Apply your knowledge</li>
              <li>• Move to advanced topics</li>
            </ul>
          </div>
        </div>
        
        <div class='text-4xl'>🧙‍♂️ ✨ 🎯</div>
        <p class='text-lg text-gray-600'>You're now a probability wizard!</p>
      </div>
    `,
    highlight: "Ready to test your knowledge with the quiz?"
  }
];
