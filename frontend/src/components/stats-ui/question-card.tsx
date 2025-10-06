import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Timer, HelpCircle, CheckCircle, XCircle } from "lucide-react";

interface QuestionCardProps {
  question: string;
  type: "MCQ" | "Numeric" | "ShortText" | "ChooseTest";
  options?: string[];
  correctAnswer?: string | number;
  hint?: string;
  timer?: number; // seconds
  onAnswer?: (answer: string | number) => void;
  onHint?: () => void;
  showResult?: boolean;
  isCorrect?: boolean;
}

export function QuestionCard({
  question,
  type,
  options = [],
  correctAnswer,
  hint,
  timer,
  onAnswer,
  onHint,
  showResult = false,
  isCorrect,
}: QuestionCardProps) {
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [numericAnswer, setNumericAnswer] = useState<string>("");
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [timeLeft, setTimeLeft] = useState(timer);

  const handleSubmit = () => {
    let answer: string | number = "";
    
    switch (type) {
      case "MCQ":
      case "ChooseTest":
        answer = selectedAnswer;
        break;
      case "Numeric":
        answer = parseFloat(numericAnswer) || 0;
        break;
      case "ShortText":
        answer = textAnswer;
        break;
    }
    
    onAnswer?.(answer);
  };

  const getResultIcon = () => {
    if (!showResult) return null;
    return isCorrect ? (
      <CheckCircle className="w-5 h-5 text-green-600" />
    ) : (
      <XCircle className="w-5 h-5 text-red-600" />
    );
  };

  const getResultColor = () => {
    if (!showResult) return "";
    return isCorrect 
      ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20"
      : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20";
  };

  return (
    <Card className={`p-6 ${getResultColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="text-primary border-primary/20">
              {type === "MCQ" ? "Multiple Choice" : 
               type === "Numeric" ? "Numeric Answer" :
               type === "ShortText" ? "Short Answer" :
               "Choose Test"}
            </Badge>
            {showResult && getResultIcon()}
          </div>
          <h4 className="font-medium leading-relaxed">
            {question}
          </h4>
        </div>
        
        {timer && timeLeft && !showResult && (
          <div className="ml-4">
            <div className="flex items-center gap-1 text-orange-600 bg-orange-50 dark:bg-orange-900/20 px-2 py-1 rounded-md caption-sm">
              <Timer className="w-3 h-3" />
              <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
            </div>
          </div>
        )}
      </div>

      {/* Question Content */}
      <div className="space-y-4">
        {type === "MCQ" && (
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={showResult}
          >
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label 
                  htmlFor={`option-${index}`} 
                  className="leading-relaxed cursor-pointer flex-1"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {type === "ChooseTest" && (
          <RadioGroup
            value={selectedAnswer}
            onValueChange={setSelectedAnswer}
            disabled={showResult}
          >
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`test-${index}`} />
                <Label 
                  htmlFor={`test-${index}`} 
                  className="leading-relaxed cursor-pointer flex-1 font-mono caption-lg"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        {type === "Numeric" && (
          <div className="space-y-2">
            <Label htmlFor="numeric-answer">Your Answer</Label>
            <Input
              id="numeric-answer"
              type="number"
              step="any"
              value={numericAnswer}
              onChange={(e) => setNumericAnswer(e.target.value)}
              placeholder="Enter numeric value"
              disabled={showResult}
            />
          </div>
        )}

        {type === "ShortText" && (
          <div className="space-y-2">
            <Label htmlFor="text-answer">Your Answer</Label>
            <Textarea
              id="text-answer"
              value={textAnswer}
              onChange={(e) => setTextAnswer(e.target.value)}
              placeholder="Enter your explanation"
              rows={3}
              disabled={showResult}
            />
          </div>
        )}
      </div>

      {/* Hint */}
      {hint && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <span className="caption-sm font-medium text-blue-900 dark:text-blue-100 block mb-1">
                Hint
              </span>
              <p className="caption-lg text-blue-800 dark:text-blue-200 leading-relaxed">
                {hint}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!showResult && (
        <div className="flex gap-2 mt-6 pt-4 border-t border-border">
          <Button 
            onClick={handleSubmit}
            disabled={
              (type === "MCQ" || type === "ChooseTest") && !selectedAnswer ||
              type === "Numeric" && !numericAnswer ||
              type === "ShortText" && !textAnswer.trim()
            }
            className="flex-1"
          >
            Submit Answer
          </Button>
          {hint && onHint && (
            <Button variant="outline" onClick={onHint}>
              <HelpCircle className="w-4 h-4 mr-2" />
              Show Hint
            </Button>
          )}
        </div>
      )}

      {/* Correct Answer Display */}
      {showResult && !isCorrect && correctAnswer && (
        <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <span className="caption-sm font-medium text-green-900 dark:text-green-100 block mb-1">
            Correct Answer
          </span>
          <p className="caption-lg text-green-800 dark:text-green-200">
            {correctAnswer.toString()}
          </p>
        </div>
      )}
    </Card>
  );
}