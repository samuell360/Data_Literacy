import { useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Badge } from "../ui/badge";
import { Play, Pause, RotateCcw, Download } from "lucide-react";
import { StatCard } from "./stat-card";

interface SimulationPanelProps {
  title: string;
  description: string;
  parameters: {
    sampleSize: number;
    iterations: number;
    distribution: string;
    mean?: number;
    stdDev?: number;
  };
  results?: {
    mean: number;
    median: number;
    stdDev: number;
    confidenceInterval: [number, number];
  };
  isRunning?: boolean;
  onRun?: (params: any) => void;
  onPause?: () => void;
  onReset?: () => void;
  onExport?: () => void;
}

export function SimulationPanel({
  title,
  description,
  parameters: initialParams,
  results,
  isRunning = false,
  onRun,
  onPause,
  onReset,
  onExport,
}: SimulationPanelProps) {
  const [params, setParams] = useState(initialParams);

  const handleRun = () => {
    onRun?.(params);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Controls Panel */}
      <Card className="p-6 border-l-4 border-l-[#7C9BFF] bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/10">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold">{title}</h3>
            <Badge variant="outline" className="text-[#7C9BFF] border-[#7C9BFF]/20">
              Simulation
            </Badge>
          </div>
          <p className="caption-lg text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="space-y-6">
          {/* Sample Size */}
          <div className="space-y-2">
            <Label htmlFor="sampleSize">Sample Size</Label>
            <div className="px-3 py-2 bg-muted rounded-lg">
              <Slider
                id="sampleSize"
                min={10}
                max={10000}
                step={10}
                value={[params.sampleSize]}
                onValueChange={(value) => 
                  setParams(prev => ({ ...prev, sampleSize: value[0] }))
                }
                className="w-full"
              />
              <div className="flex justify-between mt-1 caption-sm text-muted-foreground">
                <span>10</span>
                <span className="font-medium">{params.sampleSize}</span>
                <span>10,000</span>
              </div>
            </div>
          </div>

          {/* Iterations */}
          <div className="space-y-2">
            <Label htmlFor="iterations">Iterations</Label>
            <Input
              id="iterations"
              type="number"
              value={params.iterations}
              onChange={(e) => 
                setParams(prev => ({ ...prev, iterations: parseInt(e.target.value) || 0 }))
              }
              min="1"
              max="100000"
            />
          </div>

          {/* Distribution */}
          <div className="space-y-2">
            <Label htmlFor="distribution">Distribution Type</Label>
            <Select
              value={params.distribution}
              onValueChange={(value) => 
                setParams(prev => ({ ...prev, distribution: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="uniform">Uniform</SelectItem>
                <SelectItem value="exponential">Exponential</SelectItem>
                <SelectItem value="binomial">Binomial</SelectItem>
                <SelectItem value="poisson">Poisson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Distribution Parameters */}
          {params.distribution === "normal" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mean">Mean (μ)</Label>
                <Input
                  id="mean"
                  type="number"
                  step="0.1"
                  value={params.mean || 0}
                  onChange={(e) => 
                    setParams(prev => ({ ...prev, mean: parseFloat(e.target.value) || 0 }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="stdDev">Std Dev (σ)</Label>
                <Input
                  id="stdDev"
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={params.stdDev || 1}
                  onChange={(e) => 
                    setParams(prev => ({ ...prev, stdDev: parseFloat(e.target.value) || 1 }))
                  }
                />
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6 pt-6 border-t border-border">
          <Button
            onClick={isRunning ? onPause : handleRun}
            className="flex-1"
            disabled={!onRun}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Simulation
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onReset} disabled={!onReset}>
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={onExport} disabled={!results || !onExport}>
            <Download className="w-4 h-4" />
          </Button>
        </div>

        {/* API Information */}
        <div className="mt-4 p-3 bg-muted rounded-lg">
          <div className="caption-sm text-muted-foreground mb-1">API Endpoint:</div>
          <code className="caption-sm font-mono text-foreground">
            POST /api/v1/sim/run
          </code>
        </div>
      </Card>

      {/* Results Panel */}
      <div className="space-y-6">
        {/* Chart Placeholder */}
        <Card className="p-6 h-64 flex items-center justify-center border-dashed border-2">
          <div className="text-center text-muted-foreground">
            <div className="w-16 h-16 bg-muted rounded-lg mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-[#7C9BFF] rounded opacity-50" />
            </div>
            <p className="caption-lg">
              {isRunning ? "Simulation running..." : "Run simulation to view results"}
            </p>
          </div>
        </Card>

        {/* Key Performance Indicators */}
        {results && (
          <div className="grid grid-cols-2 gap-4">
            <StatCard
              title="Sample Mean"
              value={results.mean.toFixed(3)}
              variant="simulation"
            />
            <StatCard
              title="Sample Median"
              value={results.median.toFixed(3)}
              variant="simulation"
            />
            <StatCard
              title="Std Deviation"
              value={results.stdDev.toFixed(3)}
              variant="simulation"
            />
            <StatCard
              title="95% CI"
              value={`[${results.confidenceInterval[0].toFixed(2)}, ${results.confidenceInterval[1].toFixed(2)}]`}
              variant="simulation"
            />
          </div>
        )}
      </div>
    </div>
  );
}