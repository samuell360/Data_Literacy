'''
Bag Draw Simulation

Simulates drawing colored items from a bag with/without replacement.
'''

import numpy as np
from typing import Dict, Any, List
from collections import Counter

from app.services.sim_service.base import BaseSimulation, SimulationResult


class BagDrawSimulation(BaseSimulation):
    '''
    Bag drawing simulation for probability concepts.
    
    Demonstrates:
    - Probability with/without replacement
    - Conditional probability
    - Law of large numbers
    
    Example:
        Bag with 5 red, 3 blue, 2 green marbles.
        What's P(drawing 2 red in a row)?
    '''
    
    def run(self, params: Dict[str, Any]) -> SimulationResult:
        '''
        Run bag drawing simulation.
        
        Args:
            params:
                - colors: Dict of color -> count (e.g., {'red': 5, 'blue': 3})
                - draws: Number of items to draw
                - replacement: Whether to replace after each draw
                - trials: Number of simulation trials
                
        Returns:
            SimulationResult with probabilities and distributions
        '''
        # Extract parameters
        colors = params.get('colors', {'red': 5, 'blue': 3, 'green': 2})
        draws = params.get('draws', 2)
        replacement = params.get('replacement', False)
        trials = params.get('trials', 10000)
        
        # Validate
        if not colors or sum(colors.values()) == 0:
            raise ValueError("Bag must contain at least one item")
        if draws <= 0:
            raise ValueError("Must draw at least one item")
        if not replacement and draws > sum(colors.values()):
            raise ValueError("Cannot draw more items than in bag without replacement")
        
        # Create bag array
        bag = []
        for color, count in colors.items():
            bag.extend([color] * count)
        bag = np.array(bag)
        total_items = len(bag)
        
        # Run simulation trials
        outcomes = []
        sequence_counts = Counter()
        
        for _ in range(trials):
            if replacement:
                # Draw with replacement
                drawn = self.rng.choice(bag, size=draws, replace=True)
            else:
                # Draw without replacement
                drawn = self.rng.choice(bag, size=draws, replace=False)
            
            # Record outcome
            outcome_tuple = tuple(drawn)
            outcomes.append(outcome_tuple)
            sequence_counts[outcome_tuple] += 1
        
        # Calculate empirical probabilities
        # Count first draw colors
        first_draw_counts = Counter(outcome[0] for outcome in outcomes)
        first_draw_probs = {
            color: count / trials 
            for color, count in first_draw_counts.items()
        }
        
        # Count color frequencies at each position
        position_probs = []
        for pos in range(draws):
            pos_counts = Counter(outcome[pos] for outcome in outcomes if len(outcome) > pos)
            pos_probs = {
                color: count / trials 
                for color, count in pos_counts.items()
            }
            position_probs.append(pos_probs)
        
        # Calculate theoretical probabilities (for first draw)
        theoretical_first = {
            color: count / total_items 
            for color, count in colors.items()
        }
        
        # Find most common sequences
        top_sequences = sequence_counts.most_common(10)
        top_sequences_formatted = [
            {
                'sequence': ' → '.join(seq),
                'count': count,
                'probability': count / trials
            }
            for seq, count in top_sequences
        ]
        
        # Calculate specific event probabilities
        # Example: P(all same color)
        all_same_count = sum(
            count for seq, count in sequence_counts.items() 
            if len(set(seq)) == 1
        )
        p_all_same = all_same_count / trials
        
        # Example: P(all different colors) - only if draws <= unique colors
        unique_colors = len(colors)
        if draws <= unique_colors:
            all_different_count = sum(
                count for seq, count in sequence_counts.items() 
                if len(set(seq)) == draws
            )
            p_all_different = all_different_count / trials
        else:
            p_all_different = 0
        
        # Calculate exact probabilities for without replacement
        if not replacement and draws == 2:
            # Special case: exact calculation for 2 draws
            exact_probs = {}
            for color1 in colors:
                for color2 in colors:
                    if color1 == color2:
                        # Same color
                        n1 = colors[color1]
                        prob = (n1 / total_items) * ((n1 - 1) / (total_items - 1))
                    else:
                        # Different colors
                        n1, n2 = colors[color1], colors[color2]
                        prob = (n1 / total_items) * (n2 / (total_items - 1))
                    
                    key = f"{color1} then {color2}"
                    exact_probs[key] = round(prob, 4)
        else:
            exact_probs = None
        
        return SimulationResult(
            meta={
                'simulation': 'bag_draw',
                'bag_contents': colors,
                'total_items': total_items,
                'draws': draws,
                'replacement': replacement,
                'trials': trials
            },
            series={
                'position_probabilities': position_probs,
                'top_sequences': top_sequences_formatted
            },
            metrics={
                'first_draw_probabilities': {
                    'empirical': {k: round(v, 4) for k, v in first_draw_probs.items()},
                    'theoretical': {k: round(v, 4) for k, v in theoretical_first.items()}
                },
                'special_events': {
                    'all_same_color': round(p_all_same, 4),
                    'all_different_colors': round(p_all_different, 4)
                },
                'exact_probabilities': exact_probs,
                'unique_sequences_found': len(sequence_counts),
                'most_likely_sequence': {
                    'sequence': ' → '.join(top_sequences[0][0]) if top_sequences else None,
                    'probability': round(top_sequences[0][1] / trials, 4) if top_sequences else None
                }
            }
        )
