export const generateProbabilityLesson = (topicId: string, theme: string = 'netflix') => {
  const lessons: Record<string, any> = {
    
    // ============= DISCRETE RANDOM VARIABLES & EXPECTED VALUE =============
    'discrete-rv-emv': {
      title: "Random Variables & Expected Value",
      theme: theme,
      slides: [
        // Story Introduction
        {
          type: 'story',
          content: `
            <h1 class="text-4xl font-bold mb-4">The Netflix Gamble 🎬</h1>
            <p class="text-xl">
              You're scrolling through Netflix deciding what to watch. Each show has a different 
              "enjoyment score" and probability you'll actually finish it. How do you predict 
              your average satisfaction?
            </p>
            <p class="text-lg mt-4">
              Welcome to <strong>Expected Value</strong> - the math of making smart choices!
            </p>
          `
        },

        // Concept: What is a Random Variable?
        {
          type: 'concept',
          title: "What's a Random Variable?",
          content: `
            <p class="text-lg mb-4">
              A <strong>random variable (X)</strong> is just a number that depends on chance.
            </p>
            <div class="bg-blue-50 rounded-xl p-6 my-4">
              <h4 class="font-bold text-blue-900 mb-2">Examples:</h4>
              <ul class="space-y-2 text-gray-700">
                <li>📱 <strong>X =</strong> number of TikTok likes on your next post</li>
                <li>🎲 <strong>X =</strong> result of rolling a die (1, 2, 3, 4, 5, or 6)</li>
                <li>🎮 <strong>X =</strong> coins earned in your next game match</li>
                <li>☕ <strong>X =</strong> number of coffee orders at Starbucks in the next hour</li>
              </ul>
            </div>
            <p class="text-lg">
              <strong>Discrete</strong> means X can only take specific values (like 0, 1, 2, 3...), 
              not any decimal in between.
            </p>
          `
        },

        // Formula: Probability Distribution
        {
          type: 'formula',
          formula: {
            latex: 'Σ P(X = x) = 1   and   0 ≤ P(X = x) ≤ 1',
            explanation: `
              For any probability distribution to be VALID:
              
              1. All probabilities must be between 0 and 1 (can't have negative or >100% chance)
              2. All probabilities must add up to exactly 1 (something must happen)
              
              Think of it like a pie chart - all slices together = the whole pie!
            `,
            whenToUse: 'Use this to CHECK if a probability table makes sense before calculating anything else.',
            example: `
              Valid: P(X=0)=0.2, P(X=1)=0.5, P(X=2)=0.3 ✓ (adds to 1.0)
              Invalid: P(X=0)=0.3, P(X=1)=0.6, P(X=2)=0.4 ✗ (adds to 1.3)
            `
          }
        },

        // Example 1: Checking Validity
        {
          type: 'example',
          content: `
            <h3 class="text-2xl font-bold mb-4">Example: Instagram Story Views</h3>
            <p class="mb-4">
              You posted a story and your friend says there's a:
            </p>
            <div class="bg-gray-50 rounded-xl p-6 mb-4">
              <ul class="space-y-2">
                <li>• 20% chance of getting 0-50 views</li>
                <li>• 50% chance of getting 51-200 views</li>
                <li>• 30% chance of getting 201+ views</li>
              </ul>
            </div>
            <p class="mb-4">
              <strong>Is this valid?</strong>
            </p>
            <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p class="font-bold text-green-800">✓ YES!</p>
              <p class="text-gray-700">0.20 + 0.50 + 0.30 = 1.0 and all values are between 0 and 1</p>
            </div>
          `
        },

        // Question 1: Check validity
        {
          type: 'question',
          question: {
            type: 'mcq',
            scenario: 'Your gaming clan says loot drop rates are: Common (40%), Rare (35%), Epic (25%), Legendary (15%)',
            stem: 'Is this a valid probability distribution?',
            choices: [
              'Yes, all probabilities are between 0 and 1',
              'No, the probabilities add up to more than 100%',
              'Yes, but only if we remove Legendary',
              'No, we need negative probabilities'
            ],
            correctAnswer: 1,
            explanation: '0.40 + 0.35 + 0.25 + 0.15 = 1.15 (115%). Probabilities must sum to exactly 1.0 (100%). Someone made an error!',
            hint: 'Add up all the percentages. Do they equal 100%?'
          }
        },

        // Formula: Expected Value (Mean)
        {
          type: 'formula',
          formula: {
            latex: 'E[X] = μ = Σ [x · P(X = x)]',
            explanation: `
              Expected Value (E[X]) is the LONG-RUN AVERAGE. If you repeated this situation 
              thousands of times, what's your average outcome?
              
              HOW TO CALCULATE:
              1. Multiply each outcome (x) by its probability P(x)
              2. Add all those products together
              
              It's like a weighted average where more likely outcomes count more!
            `,
            whenToUse: 'Use E[X] to compare options, predict long-term results, or make decisions under uncertainty.',
            example: `
              Game pays: $0 (p=0.5), $10 (p=0.3), $50 (p=0.2)
              E[X] = (0)(0.5) + (10)(0.3) + (50)(0.2) = 0 + 3 + 10 = $13
              
              So if you play many times, you average $13 per game.
            `
          }
        },

        // Example 2: Calculate Expected Value
        {
          type: 'example',
          content: `
            <h3 class="text-2xl font-bold mb-4">Example: Uber Surge Pricing</h3>
            <p class="mb-4">
              Based on past data, your Friday night Uber home costs:
            </p>
            <table class="w-full bg-white rounded-lg overflow-hidden mb-4">
              <thead class="bg-purple-500 text-white">
                <tr>
                  <th class="p-3">Cost (X)</th>
                  <th class="p-3">Probability P(X)</th>
                  <th class="p-3">X · P(X)</th>
                </tr>
              </thead>
              <tbody class="text-center">
                <tr class="border-b"><td class="p-3">$15</td><td class="p-3">0.30</td><td class="p-3 bg-yellow-50">$4.50</td></tr>
                <tr class="border-b"><td class="p-3">$25</td><td class="p-3">0.50</td><td class="p-3 bg-yellow-50">$12.50</td></tr>
                <tr><td class="p-3">$40</td><td class="p-3">0.20</td><td class="p-3 bg-yellow-50">$8.00</td></tr>
              </tbody>
            </table>
            <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p class="font-bold text-green-800">E[X] = $4.50 + $12.50 + $8.00 = $25.00</p>
              <p class="text-gray-700 mt-2">Budget around $25 for your ride home on average!</p>
            </div>
          `
        },

        // Question 2: Calculate Expected Value
        {
          type: 'question',
          question: {
            type: 'mcq',
            scenario: 'A food delivery app game gives you: 0 coins (p=0.2), 1 coin (p=0.5), 2 coins (p=0.3)',
            stem: 'What is the expected value E[X] of coins per game?',
            choices: ['0.9 coins', '1.1 coins', '1.0 coins', '1.5 coins'],
            correctAnswer: 1,
            explanation: 'E[X] = (0)(0.2) + (1)(0.5) + (2)(0.3) = 0 + 0.5 + 0.6 = 1.1 coins on average per game',
            realWorldContext: 'This tells you how many coins to expect if you play 100 times (about 110 coins total)',
            hint: 'Multiply each outcome by its probability, then add them all up'
          }
        },

        // Formula: Variance and Standard Deviation
        {
          type: 'formula',
          formula: {
            latex: 'Var(X) = Σ[(x - μ)² · P(x)]   and   σ = √Var(X)',
            explanation: `
              VARIANCE measures how SPREAD OUT the outcomes are from the mean.
              
              STANDARD DEVIATION (σ) is just the square root of variance - it's in the same units as X.
              
              HOW TO CALCULATE:
              1. Find the mean (μ) first
              2. For each outcome: (x - μ)² · P(x)
              3. Add those up = Variance
              4. Take square root = Standard Deviation
              
              INTERPRETATION:
              • Small σ → outcomes cluster near the mean (predictable)
              • Large σ → outcomes spread far apart (unpredictable/risky)
            `,
            whenToUse: 'Use variance/std dev to measure RISK or CONSISTENCY. Lower = more reliable/predictable.',
            example: `
              Two games both have E[X] = $10:
              Game A: σ = $2 (win $8-$12 usually)
              Game B: σ = $50 (win $0 or $100)
              
              Same average, but B is WAY riskier!
            `
          }
        },

        // Example 3: Calculate Variance
        {
          type: 'example',
          content: `
            <h3 class="text-2xl font-bold mb-4">Example: Spotify Shuffle Consistency</h3>
            <p class="mb-4">
              Songs you'll like per 10-song shuffle: <strong>μ = 7 songs</strong>
            </p>
            <table class="w-full bg-white rounded-lg overflow-hidden mb-4">
              <thead class="bg-green-500 text-white">
                <tr>
                  <th class="p-3">X</th>
                  <th class="p-3">P(X)</th>
                  <th class="p-3">(X - μ)²</th>
                  <th class="p-3">(X - μ)² · P(X)</th>
                </tr>
              </thead>
              <tbody class="text-center text-sm">
                <tr class="border-b"><td class="p-2">5</td><td>0.2</td><td>(5-7)²=4</td><td class="bg-yellow-50">0.8</td></tr>
                <tr class="border-b"><td class="p-2">7</td><td>0.5</td><td>(7-7)²=0</td><td class="bg-yellow-50">0.0</td></tr>
                <tr><td class="p-2">9</td><td>0.3</td><td>(9-7)²=4</td><td class="bg-yellow-50">1.2</td></tr>
              </tbody>
            </table>
            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p class="font-bold text-blue-800">Var(X) = 0.8 + 0.0 + 1.2 = 2.0</p>
              <p class="font-bold text-blue-800 mt-2">σ = √2.0 ≈ 1.41 songs</p>
              <p class="text-gray-700 mt-2">Pretty consistent! Most shuffles are within 1-2 songs of the mean.</p>
            </div>
          `
        },

        // Question 3: Which has higher variability?
        {
          type: 'question',
          question: {
            type: 'mcq',
            stem: 'Two streamers both average 1000 viewers. Streamer A has σ = 50 viewers, Streamer B has σ = 500 viewers. Which statement is true?',
            choices: [
              'Streamer A is more consistent/predictable',
              'Streamer B is more consistent/predictable',
              'They are equally predictable',
              'Standard deviation does not measure consistency'
            ],
            correctAnswer: 0,
            explanation: 'Lower standard deviation = less variability = more consistent. Streamer A varies by ±50 while B varies by ±500 around the mean.',
            realWorldContext: 'Brands would prefer sponsoring Streamer A - more reliable audience size'
          }
        },

        // Concept: Expected Monetary Value (EMV)
        {
          type: 'concept',
          title: 'Expected Monetary Value (EMV)',
          content: `
            <p class="text-lg mb-4">
              <strong>EMV</strong> is just Expected Value when the outcomes are MONEY.
            </p>
            <div class="bg-purple-50 rounded-xl p-6 my-4">
              <h4 class="font-bold text-purple-900 mb-3">When to Use EMV:</h4>
              <ul class="space-y-3 text-gray-700">
                <li>💰 Comparing business deals or investments</li>
                <li>🎰 Analyzing casino games (spoiler: house always wins)</li>
                <li>📱 Deciding if in-app purchases are worth it</li>
                <li>💼 Evaluating job offers with bonuses/commissions</li>
              </ul>
            </div>
            <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p class="font-bold text-yellow-900">IMPORTANT:</p>
              <p class="text-gray-700">
                EMV ignores RISK. Two options with same EMV might have very different risk levels. 
                Always consider standard deviation too!
              </p>
            </div>
          `
        },

        // Example 4: EMV Decision
        {
          type: 'example',
          content: `
            <h3 class="text-2xl font-bold mb-4">Example: Which Job Offer?</h3>
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div class="bg-blue-50 rounded-xl p-4 border-2 border-blue-300">
                <h4 class="font-bold text-blue-900 mb-2">Job A: Startup</h4>
                <ul class="text-sm space-y-1">
                  <li>$60k salary (p=0.6)</li>
                  <li>$100k if company succeeds (p=0.3)</li>
                  <li>$40k if company struggles (p=0.1)</li>
                </ul>
                <p class="font-bold text-blue-800 mt-2">EMV = ?</p>
              </div>
              <div class="bg-green-50 rounded-xl p-4 border-2 border-green-300">
                <h4 class="font-bold text-green-900 mb-2">Job B: Corporate</h4>
                <ul class="text-sm space-y-1">
                  <li>$70k guaranteed (p=1.0)</li>
                </ul>
                <p class="font-bold text-green-800 mt-2">EMV = $70k</p>
              </div>
            </div>
            <div class="bg-white rounded-xl p-4 border-2 border-gray-300">
              <p class="font-bold mb-2">Job A Calculation:</p>
              <p>EMV = (60k)(0.6) + (100k)(0.3) + (40k)(0.1)</p>
              <p>EMV = 36k + 30k + 4k = <strong>$70k</strong></p>
            </div>
            <div class="bg-orange-50 border-l-4 border-orange-500 p-4 rounded mt-4">
              <p class="font-bold text-orange-800">Same EMV! But Job B is less risky (no variance).</p>
              <p class="text-gray-700 text-sm mt-2">Your choice depends on risk tolerance!</p>
            </div>
          `
        },

        // Question 4: EMV Comparison
        {
          type: 'question',
          question: {
            type: 'mcq',
            scenario: 'Investment A: Lose $100 (p=0.4) or gain $300 (p=0.6). Investment B: Guaranteed $150.',
            stem: 'Which investment has the higher EMV?',
            choices: [
              'Investment A has higher EMV ($140)',
              'Investment B has higher EMV ($150)',
              'They have the same EMV',
              'Cannot determine without standard deviation'
            ],
            correctAnswer: 0,
            explanation: 'A: EMV = (-100)(0.4) + (300)(0.6) = -40 + 180 = $140. B: EMV = $150. So B has slightly higher EMV, but A has potential for $300!',
            hint: 'Calculate E[X] for Investment A first, remembering that losses are negative'
          }
        },

        // Real-World Practice Data
        {
          type: 'question',
          question: {
            type: 'fill',
            scenario: 'Your YouTube channel earnings per video: $0 (30%), $50 (50%), $200 (20%)',
            stem: 'What is your expected earnings per video? (Enter number only)',
            correctAnswer: '65',
            explanation: 'E[X] = (0)(0.3) + (50)(0.5) + (200)(0.2) = 0 + 25 + 40 = $65 per video on average',
            realWorldContext: 'If you post 10 videos, expect around $650 total revenue'
          }
        },

        // Summary
        {
          type: 'summary',
          content: `
            <ul class="space-y-3 text-lg">
              <li>✓ <strong>Random Variable (X):</strong> A number determined by chance</li>
              <li>✓ <strong>Valid Distribution:</strong> All P(X) between 0 and 1, sum to 1</li>
              <li>✓ <strong>E[X] = μ:</strong> Long-run average (multiply & add)</li>
              <li>✓ <strong>Var(X):</strong> Measures spread/risk</li>
              <li>✓ <strong>σ:</strong> Square root of variance (same units as X)</li>
              <li>✓ <strong>EMV:</strong> Expected value for money decisions</li>
              <li>✓ <strong>Key Insight:</strong> Same E[X] can have different risk (σ)</li>
            </ul>
            <div class="mt-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 border-2 border-purple-300">
              <p class="font-bold text-purple-900 text-center">
                Use E[X] to predict averages. Use σ to measure risk!
              </p>
            </div>
          `
        }
      ]
    },

    // ============= BINOMIAL DISTRIBUTION =============
    'binomial': {
      title: "Binomial Distribution",
      theme: theme,
      slides: [
        {
          type: 'story',
          content: `
            <h1 class="text-4xl font-bold mb-4">The Free Throw Challenge 🏀</h1>
            <p class="text-xl">
              You're at the gym. You shoot free throws with 70% accuracy. 
              If you take 10 shots, what's the probability you make exactly 7?
            </p>
            <p class="text-lg mt-4">
              This is a <strong>Binomial</strong> problem - repeated trials with two outcomes!
            </p>
          `
        },
        
        {
          type: 'concept',
          title: 'When Does Binomial Apply?',
          content: `
            <div class="space-y-4">
              <p class="text-lg font-semibold text-purple-800">The Binomial Checklist (all must be TRUE):</p>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="bg-green-50 rounded-xl p-4 border-2 border-green-400">
                  <p class="font-bold text-green-800 mb-2">✓ Fixed number of trials (n)</p>
                  <p class="text-sm text-gray-700">Example: Flip a coin 10 times</p>
                </div>
                <div class="bg-green-50 rounded-xl p-4 border-2 border-green-400">
                  <p class="font-bold text-green-800 mb-2">✓ Two outcomes only</p>
                  <p class="text-sm text-gray-700">Success or Failure (Make or Miss)</p>
                </div>
                <div class="bg-green-50 rounded-xl p-4 border-2 border-green-400">
                  <p class="font-bold text-green-800 mb-2">✓ Same probability each time (p)</p>
                  <p class="text-sm text-gray-700">Your skill doesn't change mid-game</p>
                </div>
                <div class="bg-green-50 rounded-xl p-4 border-2 border-green-400">
                  <p class="font-bold text-green-800 mb-2">✓ Independent trials</p>
                  <p class="text-sm text-gray-700">Each shot doesn't affect the next</p>
                </div>
              </div>
            </div>
          `
        },

        {
          type: 'formula',
          formula: {
            latex: 'P(X = k) = C(n,k) × p^k × (1-p)^(n-k)',
            explanation: `
              The Binomial Formula has three parts:
              
              • C(n,k) = "n choose k" = ways to arrange k successes in n trials
              • p^k = probability of k successes
              • (1-p)^(n-k) = probability of (n-k) failures
              
              WHERE:
              n = total number of trials
              k = number of successes you want
              p = probability of success on each trial
            `,
            whenToUse: 'Use when you have repeated independent trials with fixed probability',
            example: `
              10 free throws, 70% accuracy, want exactly 7 makes:
              P(X=7) = C(10,7) × (0.7)^7 × (0.3)^3
              P(X=7) = 120 × 0.0824 × 0.027 = 0.267 = 26.7%
            `
          }
        },

        {
          type: 'question',
          question: {
            type: 'mcq',
            scenario: 'You post 5 TikTok videos. Each has a 40% chance of going viral (>10k views).',
            stem: 'What is this an example of?',
            choices: [
              'Normal distribution',
              'Binomial distribution',
              'Poisson distribution',
              'Uniform distribution'
            ],
            correctAnswer: 1,
            explanation: 'This is Binomial: fixed trials (5 videos), two outcomes (viral/not viral), same probability (40%), independent trials.',
            realWorldContext: 'Perfect for social media analytics!'
          }
        },

        {
          type: 'summary',
          content: `
            <ul class="space-y-3 text-lg">
              <li>✓ <strong>Binomial:</strong> Fixed trials, two outcomes, same probability, independent</li>
              <li>✓ <strong>Formula:</strong> P(X=k) = C(n,k) × p^k × (1-p)^(n-k)</li>
              <li>✓ <strong>Real Examples:</strong> Free throws, coin flips, social media posts</li>
              <li>✓ <strong>Key Insight:</strong> Perfect for "success/failure" counting problems</li>
            </ul>
            <div class="mt-6 bg-gradient-to-r from-green-100 to-blue-100 rounded-xl p-4 border-2 border-green-300">
              <p class="font-bold text-green-900 text-center">
                When in doubt, check the Binomial checklist!
              </p>
            </div>
          `
        }
      ]
    }
  };

  return lessons[topicId] || lessons['discrete-rv-emv'];
};
