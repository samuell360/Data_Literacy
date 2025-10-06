'''
Pi Estimation using Monte Carlo (Darts) Simulation

Estimates π by throwing random darts at a square containing a circle.
'''

import numpy as np
from typing import Dict, Any

from app.services.sim_service.base import BaseSimulation, SimulationResult
from app.core.config import settings


class PiDartsSimulation(BaseSimulation):
    '''
    Monte Carlo simulation to estimate π.
    
    Throws random points in a unit square and counts how many
    fall inside the inscribed circle. The ratio approximates π/4.
    
    Math:
        - Square has area = 1
        - Circle has area = π/4
        - Ratio of points inside = π/4
        - Therefore: π ≈ 4 * (points inside / total points)
    '''
    
    def run(self, params: Dict[str, Any]) -> SimulationResult:
        '''
        Run Pi estimation simulation.
        
        Args:
            params:
                - trials: Number of darts to throw (default 10000)
                - batch_size: Process in batches for memory efficiency
                
        Returns:
            SimulationResult with:
                - meta: Simulation parameters
                - series: Running estimates over time
                - metrics: Final π estimate and statistics
        '''
        # Extract and validate parameters
        trials = params.get('trials', 10000)
        batch_size = params.get('batch_size', min(trials, 100000))
        
        # Validate
        self.validate_params(
            {'trials': trials},
            {'trials': (1, settings.MAX_SIMULATION_TRIALS)}
        )
        
        # Initialize results
        inside_count = 0
        running_estimates = []
        sample_points = []  # Store some points for visualization
        
        # Process in batches for memory efficiency
        for batch_start in range(0, trials, batch_size):
            batch_end = min(batch_start + batch_size, trials)
            batch_trials = batch_end - batch_start
            
            # Generate random points in unit square
            # Using single allocation and in-place operations
            x = self.rng.random(batch_trials, dtype=np.float32)
            y = self.rng.random(batch_trials, dtype=np.float32)
            
            # Calculate distance from origin (in-place for memory efficiency)
            # r² = x² + y²
            r_squared = x * x + y * y
            
            # Count points inside unit circle (r² ≤ 1)
            batch_inside = np.sum(r_squared <= 1.0)
            inside_count += batch_inside
            
            # Store sample points for visualization (first batch only)
            if batch_start == 0 and batch_trials <= 1000:
                sample_points = [
                    {'x': float(x[i]), 'y': float(y[i]), 
                     'inside': bool(r_squared[i] <= 1.0)}
                    for i in range(min(100, batch_trials))
                ]
            
            # Calculate running estimate every 1000 points
            if (batch_end % 1000 == 0) or (batch_end == trials):
                pi_estimate = 4.0 * inside_count / batch_end
                running_estimates.append({
                    'n': batch_end,
                    'estimate': pi_estimate,
                    'error': abs(pi_estimate - np.pi)
                })
        
        # Final calculation
        final_pi = 4.0 * inside_count / trials
        error = abs(final_pi - np.pi)
        relative_error = error / np.pi * 100
        
        # Calculate confidence interval (using normal approximation)
        # Standard error for proportion: sqrt(p(1-p)/n)
        p = inside_count / trials  # Proportion inside circle
        se = np.sqrt(p * (1 - p) / trials)
        ci_95 = (4 * (p - 1.96 * se), 4 * (p + 1.96 * se))
        
        return SimulationResult(
            meta={
                'simulation': 'pi_darts',
                'trials': trials,
                'seed': params.get('seed')
            },
            series={
                'running_estimates': running_estimates[-50:],  # Last 50 points
                'sample_points': sample_points  # For scatter plot
            },
            metrics={
                'pi_estimate': round(final_pi, 6),
                'actual_pi': round(np.pi, 6),
                'absolute_error': round(error, 6),
                'relative_error_pct': round(relative_error, 4),
                'points_inside': inside_count,
                'points_total': trials,
                'proportion_inside': round(inside_count / trials, 6),
                'confidence_interval_95': {
                    'lower': round(ci_95[0], 6),
                    'upper': round(ci_95[1], 6)
                }
            }
        )
