'''
Central Limit Theorem Simulation

Demonstrates how sample means converge to normal distribution.
'''

import numpy as np
from typing import Dict, Any, List
from scipy import stats

from app.services.sim_service.base import BaseSimulation, SimulationResult
from app.core.config import settings


class CLTSimulation(BaseSimulation):
    '''
    Central Limit Theorem demonstration.
    
    Shows that the sampling distribution of the mean approaches
    a normal distribution as sample size increases, regardless
    of the underlying distribution.
    
    Math:
        - If X₁, X₂, ..., Xₙ are i.i.d. with mean μ and variance σ²
        - Then X̄ₙ ~ N(μ, σ²/n) as n → ∞
        - Standard Error: SE = σ / √n
    '''
    
    def run(self, params: Dict[str, Any]) -> SimulationResult:
        '''
        Run CLT simulation.
        
        Args:
            params:
                - distribution: 'uniform', 'exponential', 'binomial'
                - sample_size: Size of each sample
                - num_samples: Number of sample means to generate
                - dist_params: Distribution-specific parameters
                
        Returns:
            SimulationResult with sampling distribution of means
        '''
        # Extract parameters
        distribution = params.get('distribution', 'uniform')
        sample_size = params.get('sample_size', 30)
        num_samples = params.get('num_samples', 1000)
        dist_params = params.get('dist_params', {})
        
        # Validate
        self.validate_params(
            {'sample_size': sample_size, 'num_samples': num_samples},
            {'sample_size': (1, 1000), 
             'num_samples': (1, settings.MAX_SIMULATION_REPLICATES)}
        )
        
        # Generate samples based on distribution
        if distribution == 'uniform':
            # Uniform(a, b)
            a = dist_params.get('a', 0)
            b = dist_params.get('b', 1)
            true_mean = (a + b) / 2
            true_var = (b - a) ** 2 / 12
            
            # Generate all samples at once for efficiency
            samples = self.rng.uniform(a, b, size=(num_samples, sample_size))
            
        elif distribution == 'exponential':
            # Exponential(λ)
            scale = dist_params.get('scale', 1.0)
            true_mean = scale
            true_var = scale ** 2
            
            samples = self.rng.exponential(scale, size=(num_samples, sample_size))
            
        elif distribution == 'binomial':
            # Binomial(n, p)
            n = dist_params.get('n', 10)
            p = dist_params.get('p', 0.5)
            true_mean = n * p
            true_var = n * p * (1 - p)
            
            samples = self.rng.binomial(n, p, size=(num_samples, sample_size))
            
        else:
            raise ValueError(f"Unknown distribution: {distribution}")
        
        # Calculate sample means
        sample_means = np.mean(samples, axis=1)
        
        # Theoretical standard error
        theoretical_se = np.sqrt(true_var / sample_size)
        
        # Calculate statistics
        observed_mean = np.mean(sample_means)
        observed_se = np.std(sample_means, ddof=1)
        
        # Normality test (Shapiro-Wilk)
        if num_samples <= 5000:  # Shapiro-Wilk has sample size limit
            _, p_value = stats.shapiro(sample_means)
        else:
            # Use Kolmogorov-Smirnov test for large samples
            _, p_value = stats.kstest(
                sample_means, 
                'norm', 
                args=(true_mean, theoretical_se)
            )
        
        # Create histogram bins
        hist, bin_edges = np.histogram(sample_means, bins=30, density=True)
        
        # Generate normal curve for comparison
        x_range = np.linspace(sample_means.min(), sample_means.max(), 100)
        normal_pdf = stats.norm.pdf(x_range, true_mean, theoretical_se)
        
        return SimulationResult(
            meta={
                'simulation': 'clt',
                'distribution': distribution,
                'sample_size': sample_size,
                'num_samples': num_samples,
                'dist_params': dist_params
            },
            series={
                'sample_means': sample_means.tolist()[:1000],  # Limit for transfer
                'histogram': {
                    'counts': hist.tolist(),
                    'bins': bin_edges.tolist()
                },
                'normal_curve': {
                    'x': x_range.tolist(),
                    'y': normal_pdf.tolist()
                }
            },
            metrics={
                'theoretical_mean': round(true_mean, 6),
                'observed_mean': round(observed_mean, 6),
                'theoretical_se': round(theoretical_se, 6),
                'observed_se': round(observed_se, 6),
                'se_error_pct': round(abs(observed_se - theoretical_se) / theoretical_se * 100, 2),
                'normality_test': {
                    'p_value': round(p_value, 6),
                    'is_normal': p_value > 0.05,
                    'interpretation': "Normally distributed" if p_value > 0.05 else "Not normally distributed"
                },
                'percentiles': {
                    '25th': round(np.percentile(sample_means, 25), 6),
                    '50th': round(np.percentile(sample_means, 50), 6),
                    '75th': round(np.percentile(sample_means, 75), 6)
                }
            }
        )
