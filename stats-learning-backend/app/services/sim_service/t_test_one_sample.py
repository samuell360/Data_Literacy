'''
One-Sample T-Test Simulation

Tests if a sample mean differs from a hypothesized value.
'''

import numpy as np
from typing import Dict, Any, Optional, List
from scipy import stats

from app.services.sim_service.base import BaseSimulation, SimulationResult


class OneSampleTTestSimulation(BaseSimulation):
    '''
    One-sample t-test implementation.
    
    Tests whether a sample mean significantly differs from
    a hypothesized population mean when population variance is unknown.
    
    Math:
        t = (x̄ - μ₀) / (s / √n)
        where:
        - x̄ = sample mean
        - μ₀ = hypothesized population mean
        - s = sample standard deviation
        - n = sample size
        - df = n - 1 (degrees of freedom)
    
    Example use case:
        Testing if average student test scores (x̄ = 75) differ
        significantly from the national average (μ₀ = 70)
    '''
    
    def run(self, params: Dict[str, Any]) -> SimulationResult:
        '''
        Run one-sample t-test.
        
        Args:
            params:
                - data: List of sample values OR
                - sample_mean: Pre-calculated mean
                - sample_std: Pre-calculated standard deviation
                - n: Sample size (if using summary stats)
                - mu0: Hypothesized population mean
                - alternative: 'two-sided', 'greater', or 'less'
                - alpha: Significance level
                
        Returns:
            SimulationResult with test statistics and decision
        '''
        # Extract parameters
        alpha = params.get('alpha', 0.05)
        mu0 = params.get('mu0', 0)
        alternative = params.get('alternative', 'two-sided')
        
        # Get sample statistics
        if 'data' in params:
            # Calculate from raw data
            data = np.array(params['data'])
            n = len(data)
            sample_mean = np.mean(data)
            sample_std = np.std(data, ddof=1)  # ddof=1 for sample std
            
            # Additional descriptive statistics
            sample_median = np.median(data)
            q1, q3 = np.percentile(data, [25, 75])
            iqr = q3 - q1
        else:
            # Use provided summary statistics
            sample_mean = params.get('sample_mean')
            sample_std = params.get('sample_std')
            n = params.get('n')
            
            if None in [sample_mean, sample_std, n]:
                raise ValueError("Must provide either 'data' or all of: sample_mean, sample_std, n")
            
            sample_median = None
            q1 = q3 = iqr = None
        
        # Validate inputs
        if n <= 1:
            raise ValueError("Sample size must be greater than 1")
        if sample_std < 0:
            raise ValueError("Standard deviation cannot be negative")
        
        # Calculate degrees of freedom
        df = n - 1
        
        # Calculate standard error
        se = sample_std / np.sqrt(n)
        
        # Calculate t-statistic
        if se > 0:
            t_stat = (sample_mean - mu0) / se
        else:
            # Handle case where all values are identical
            t_stat = np.inf if sample_mean != mu0 else 0
        
        # Calculate p-value
        if alternative == 'two-sided':
            p_value = 2 * (1 - stats.t.cdf(abs(t_stat), df))
            t_critical = stats.t.ppf(1 - alpha/2, df)
            reject_region = f"|t| > {t_critical:.3f}"
        elif alternative == 'greater':
            p_value = 1 - stats.t.cdf(t_stat, df)
            t_critical = stats.t.ppf(1 - alpha, df)
            reject_region = f"t > {t_critical:.3f}"
        elif alternative == 'less':
            p_value = stats.t.cdf(t_stat, df)
            t_critical = stats.t.ppf(alpha, df)
            reject_region = f"t < {t_critical:.3f}"
        else:
            raise ValueError("Alternative must be 'two-sided', 'greater', or 'less'")
        
        # Make decision
        reject_null = p_value < alpha
        
        # Calculate confidence interval
        t_critical_ci = stats.t.ppf(1 - alpha/2, df)
        margin_of_error = t_critical_ci * se
        ci_lower = sample_mean - margin_of_error
        ci_upper = sample_mean + margin_of_error
        
        # Calculate effect size (Cohen's d)
        cohens_d = (sample_mean - mu0) / sample_std if sample_std > 0 else 0
        
        # Power calculation (post-hoc)
        # Non-centrality parameter
        ncp = abs(sample_mean - mu0) / se if se > 0 else 0
        
        if alternative == 'two-sided':
            power = 1 - stats.nct.cdf(t_critical, df, ncp) + stats.nct.cdf(-t_critical, df, ncp)
        elif alternative == 'greater':
            power = 1 - stats.nct.cdf(t_critical, df, ncp)
        else:  # less
            power = stats.nct.cdf(t_critical, df, -ncp)
        
        # Generate visualization data
        # T-distribution under null hypothesis
        x_range = np.linspace(-4, 4, 200)
        null_dist = stats.t.pdf(x_range, df)
        
        # Alternative distribution (for power visualization)
        alt_dist = stats.t.pdf(x_range, df, loc=t_stat)
        
        return SimulationResult(
            meta={
                'test': 'one_sample_t_test',
                'alternative': alternative,
                'alpha': alpha,
                'degrees_of_freedom': df
            },
            series={
                'null_distribution': {
                    'x': x_range.tolist(),
                    'y': null_dist.tolist()
                },
                'alternative_distribution': {
                    'x': x_range.tolist(),
                    'y': alt_dist.tolist()
                },
                'test_statistic_position': t_stat,
                'critical_values': {
                    'lower': -t_critical if alternative == 'two-sided' else None,
                    'upper': t_critical if alternative != 'less' else None
                }
            },
            metrics={
                'sample_mean': round(sample_mean, 4),
                'sample_std': round(sample_std, 4),
                'sample_size': n,
                'hypothesized_mean': mu0,
                'standard_error': round(se, 6),
                't_statistic': round(t_stat, 4),
                'degrees_of_freedom': df,
                'p_value': round(p_value, 6),
                'decision': 'Reject null hypothesis' if reject_null else 'Fail to reject null hypothesis',
                'reject_null': reject_null,
                'rejection_region': reject_region,
                'confidence_interval': {
                    'level': f"{(1-alpha)*100:.0f}%",
                    'lower': round(ci_lower, 4),
                    'upper': round(ci_upper, 4),
                    'margin_of_error': round(margin_of_error, 4)
                },
                'effect_size': {
                    'cohens_d': round(cohens_d, 4),
                    'interpretation': self._interpret_cohens_d(abs(cohens_d))
                },
                'power': round(power, 4),
                'descriptive_stats': {
                    'median': round(sample_median, 4) if sample_median is not None else None,
                    'q1': round(q1, 4) if q1 is not None else None,
                    'q3': round(q3, 4) if q3 is not None else None,
                    'iqr': round(iqr, 4) if iqr is not None else None
                }
            }
        )
    
    def _interpret_cohens_d(self, d: float) -> str:
        '''Interpret Cohen's d effect size'''
        if d < 0.2:
            return "Small effect"
        elif d < 0.5:
            return "Small to medium effect"
        elif d < 0.8:
            return "Medium to large effect"
        else:
            return "Large effect"
