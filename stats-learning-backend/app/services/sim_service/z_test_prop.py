'''
One-Proportion Z-Test Simulation

Tests if a sample proportion differs from a hypothesized value.
'''

import numpy as np
from typing import Dict, Any
from scipy import stats

from app.services.sim_service.base import BaseSimulation, SimulationResult


class ZTestProportionSimulation(BaseSimulation):
    '''
    One-proportion z-test implementation.
    
    Tests whether a sample proportion significantly differs from
    a hypothesized population proportion.
    
    Math:
        z = (p̂ - p₀) / √(p₀(1-p₀)/n)
        where:
        - p̂ = sample proportion
        - p₀ = hypothesized proportion
        - n = sample size
    
    Example use case:
        Testing if a coin is fair (p₀ = 0.5) after observing
        60 heads in 100 flips (p̂ = 0.6)
    '''
    
    def run(self, params: Dict[str, Any]) -> SimulationResult:
        '''
        Run one-proportion z-test.
        
        Args:
            params:
                - successes: Number of successes observed
                - n: Sample size
                - p0: Hypothesized proportion (default 0.5)
                - alternative: 'two-sided', 'greater', or 'less'
                - alpha: Significance level (default 0.05)
                
        Returns:
            SimulationResult with test statistics and decision
        '''
        # Extract parameters
        successes = params.get('successes', 50)
        n = params.get('n', 100)
        p0 = params.get('p0', 0.5)
        alternative = params.get('alternative', 'two-sided')
        alpha = params.get('alpha', 0.05)
        
        # Validate inputs
        if n <= 0:
            raise ValueError("Sample size must be positive")
        if successes < 0 or successes > n:
            raise ValueError("Successes must be between 0 and n")
        if p0 <= 0 or p0 >= 1:
            raise ValueError("Hypothesized proportion must be between 0 and 1")
        
        # Calculate sample proportion
        p_hat = successes / n
        
        # Check conditions for z-test
        # Need np₀ ≥ 10 and n(1-p₀) ≥ 10
        expected_successes = n * p0
        expected_failures = n * (1 - p0)
        conditions_met = (expected_successes >= 10) and (expected_failures >= 10)
        
        # Calculate standard error
        # Add small epsilon to avoid division by zero
        epsilon = 1e-12
        se = np.sqrt(max(p0 * (1 - p0) / n, epsilon))
        
        # Calculate z-statistic
        z_stat = (p_hat - p0) / se
        
        # Calculate p-value based on alternative hypothesis
        if alternative == 'two-sided':
            p_value = 2 * (1 - stats.norm.cdf(abs(z_stat)))
            # Critical values for two-sided test
            z_critical = stats.norm.ppf(1 - alpha/2)
            reject_region = f"|z| > {z_critical:.3f}"
        elif alternative == 'greater':
            p_value = 1 - stats.norm.cdf(z_stat)
            z_critical = stats.norm.ppf(1 - alpha)
            reject_region = f"z > {z_critical:.3f}"
        elif alternative == 'less':
            p_value = stats.norm.cdf(z_stat)
            z_critical = stats.norm.ppf(alpha)
            reject_region = f"z < {z_critical:.3f}"
        else:
            raise ValueError("Alternative must be 'two-sided', 'greater', or 'less'")
        
        # Make decision
        reject_null = p_value < alpha
        
        # Calculate confidence interval (Wilson score interval for better coverage)
        z_alpha = stats.norm.ppf(1 - alpha/2)
        denominator = 1 + z_alpha**2 / n
        center = (p_hat + z_alpha**2 / (2*n)) / denominator
        margin = z_alpha * np.sqrt(p_hat*(1-p_hat)/n + z_alpha**2/(4*n**2)) / denominator
        ci_lower = max(0, center - margin)
        ci_upper = min(1, center + margin)
        
        # Calculate effect size (Cohen's h)
        # h = 2 * arcsin(√p₁) - 2 * arcsin(√p₀)
        cohens_h = 2 * (np.arcsin(np.sqrt(p_hat)) - np.arcsin(np.sqrt(p0)))
        
        # Power calculation (post-hoc)
        if alternative == 'two-sided':
            power = stats.norm.cdf(abs(z_stat) - z_critical) + stats.norm.cdf(-abs(z_stat) - z_critical)
        elif alternative == 'greater':
            power = 1 - stats.norm.cdf(z_critical - z_stat)
        else:  # less
            power = stats.norm.cdf(z_critical - z_stat)
        
        # Generate visualization data
        # Normal curve for null hypothesis
        x_range = np.linspace(-4, 4, 200)
        null_dist = stats.norm.pdf(x_range, 0, 1)
        
        return SimulationResult(
            meta={
                'test': 'one_proportion_z_test',
                'alternative': alternative,
                'alpha': alpha
            },
            series={
                'null_distribution': {
                    'x': x_range.tolist(),
                    'y': null_dist.tolist()
                },
                'test_statistic_position': z_stat,
                'critical_values': {
                    'lower': -z_critical if alternative == 'two-sided' else None,
                    'upper': z_critical if alternative != 'less' else None
                }
            },
            metrics={
                'sample_proportion': round(p_hat, 4),
                'hypothesized_proportion': p0,
                'sample_size': n,
                'successes': successes,
                'z_statistic': round(z_stat, 4),
                'p_value': round(p_value, 6),
                'standard_error': round(se, 6),
                'decision': 'Reject null hypothesis' if reject_null else 'Fail to reject null hypothesis',
                'reject_null': reject_null,
                'rejection_region': reject_region,
                'confidence_interval': {
                    'level': f"{(1-alpha)*100:.0f}%",
                    'lower': round(ci_lower, 4),
                    'upper': round(ci_upper, 4)
                },
                'effect_size': {
                    'cohens_h': round(cohens_h, 4),
                    'interpretation': self._interpret_cohens_h(abs(cohens_h))
                },
                'power': round(power, 4),
                'conditions': {
                    'met': conditions_met,
                    'np0': round(expected_successes, 1),
                    'n_1_minus_p0': round(expected_failures, 1),
                    'requirement': 'Both should be ≥ 10'
                }
            }
        )
    
    def _interpret_cohens_h(self, h: float) -> str:
        '''Interpret Cohen's h effect size'''
        if h < 0.2:
            return "Small effect"
        elif h < 0.5:
            return "Medium effect"
        elif h < 0.8:
            return "Large effect"
        else:
            return "Very large effect"
