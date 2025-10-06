'''
Base Simulation Service

Common functionality for all simulations.
'''

from typing import Dict, Any, Optional, Tuple
from abc import ABC, abstractmethod
import numpy as np
from pydantic import BaseModel


class SimulationParams(BaseModel):
    '''Base parameters for simulations'''
    seed: Optional[int] = None  # For reproducibility


class SimulationResult(BaseModel):
    '''Base result structure for simulations'''
    meta: Dict[str, Any]       # Metadata about the simulation
    series: Optional[Any]       # Data series for visualization
    metrics: Dict[str, Any]    # Computed metrics


class BaseSimulation(ABC):
    '''
    Abstract base class for simulations.
    
    All simulations should inherit from this class and implement
    the run method.
    '''
    
    def __init__(self, seed: Optional[int] = None):
        '''
        Initialize simulation with optional seed.
        
        Args:
            seed: Random seed for reproducibility
        '''
        self.rng = np.random.default_rng(seed)
    
    @abstractmethod
    def run(self, params: Dict[str, Any]) -> SimulationResult:
        '''
        Run the simulation with given parameters.
        
        Args:
            params: Simulation-specific parameters
            
        Returns:
            SimulationResult with computed data
        '''
        pass
    
    def validate_params(self, params: Dict[str, Any], constraints: Dict[str, Tuple]) -> None:
        '''
        Validate parameters against constraints.
        
        Args:
            params: Parameters to validate
            constraints: Dict of parameter_name -> (min, max) tuples
            
        Raises:
            ValueError: If parameters are invalid
        '''
        for param_name, (min_val, max_val) in constraints.items():
            if param_name in params:
                value = params[param_name]
                if value < min_val or value > max_val:
                    raise ValueError(
                        f"{param_name} must be between {min_val} and {max_val}, got {value}"
                    )
