import { useState } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { 
  Heart, 
  Flame, 
  Star, 
  CheckCircle2, 
  X, 
  ArrowRight, 
  Zap,
  Target,
  Trophy,
  Brain
} from "lucide-react";

interface QuizQuestion {
  id: string;
  type: "multiple-choice" | "true-false" | "fill-blank" | "match";
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  points: number;
  difficulty: "easy" | "medium" | "hard";
}

interface DuolingoQuizProps {
  title?: string;
  questions: QuizQuestion[];
  totalHearts?: number;
  streakCount?: number;
  onComplete?: (score: number, hearts: number) => void;
}

export function DuolingoQuiz({ 
  title = "Statistics Quiz", 
  questions, 
  totalHearts = 5, 
  streakCount = 0,
  onComplete 
}: DuolingoQuizProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [hearts, setHearts] = useState(totalHearts);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  const handleAnswerSelect = (answer: string) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
  };

  const handleSubmitAnswer = () => {
    if (!selectedAnswer) return;

    const correct = Array.isArray(currentQuestion.correctAnswer) 
      ? currentQuestion.correctAnswer.includes(selectedAnswer)
      : selectedAnswer === currentQuestion.correctAnswer;

    setIsCorrect(correct);
    setIsAnswered(true);
    setShowExplanation(true);

    if (correct) {
      setScore(prev => prev + currentQuestion.points);
    } else {
      setHearts(prev => Math.max(0, prev - 1));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setShowExplanation(false);
      setIsCorrect(false);
    } else {
      setQuizCompleted(true);
      onComplete?.(score, hearts);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy": return "text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800";
      case "medium": return "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800";
      case "hard": return "text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800";
      default: return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800";
    }
  };

  if (quizCompleted) {
    const percentage = Math.round((score / (questions.reduce((sum, q) => sum + q.points, 0))) * 100);
    const isGoodScore = percentage >= 80;
    
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20 border-green-200 dark:border-green-800">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <Trophy className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="display-md mb-4 text-green-600">Quiz Complete!</h2>
        <p className="text-muted-foreground mb-6">Great job! You've finished the {title}.</p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{score}</div>
            <div className="caption-sm text-muted-foreground">Points Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{percentage}%</div>
            <div className="caption-sm text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center flex justify-center items-center">
            {Array.from({ length: 5 }).map((_, i) => (
              <Heart 
                key={i} 
                className={`w-5 h-5 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} 
              />
            ))}
            <div className="caption-sm text-muted-foreground ml-2">Hearts Left</div>
          </div>
        </div>
        
        <div className="flex justify-center gap-3">
          <Button onClick={() => window.location.reload()} className="flex items-center gap-2">
            <ArrowRight className="w-4 h-4" />
            Continue Learning
          </Button>
          <Button variant="outline">Review Mistakes</Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm">
            <X className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <Progress value={progress} className="w-64 h-3" />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* Hearts */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalHearts }).map((_, i) => (
              <Heart 
                key={i} 
                className={`w-5 h-5 ${i < hearts ? 'text-red-500 fill-red-500' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          
          {/* Streak */}
          <div className="flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-medium text-orange-600">{streakCount}</span>
          </div>
        </div>
      </div>

      {/* Question Card */}
      <Card className="p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold">Question {currentQuestionIndex + 1} of {questions.length}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getDifficultyColor(currentQuestion.difficulty)}>
                  {currentQuestion.difficulty}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  {currentQuestion.points} pts
                </Badge>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-medium leading-relaxed">
            {currentQuestion.question}
          </h2>

          {/* Answer Options */}
          {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const isCorrectAnswer = Array.isArray(currentQuestion.correctAnswer) 
                  ? currentQuestion.correctAnswer.includes(option)
                  : option === currentQuestion.correctAnswer;
                
                let buttonStyle = "justify-start text-left h-auto p-4 ";
                
                if (isAnswered) {
                  if (isCorrectAnswer) {
                    buttonStyle += "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400";
                  } else if (isSelected && !isCorrect) {
                    buttonStyle += "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400";
                  } else {
                    buttonStyle += "opacity-50";
                  }
                } else if (isSelected) {
                  buttonStyle += "bg-primary/10 border-primary text-primary";
                } else {
                  buttonStyle += "hover:bg-muted";
                }

                return (
                  <Button
                    key={index}
                    variant="outline"
                    className={buttonStyle}
                    onClick={() => handleAnswerSelect(option)}
                    disabled={isAnswered}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full border-2 border-current flex items-center justify-center font-medium">
                        {String.fromCharCode(65 + index)}
                      </div>
                      <span>{option}</span>
                      {isAnswered && isCorrectAnswer && (
                        <CheckCircle2 className="w-5 h-5 ml-auto" />
                      )}
                      {isAnswered && isSelected && !isCorrect && (
                        <X className="w-5 h-5 ml-auto" />
                      )}
                    </div>
                  </Button>
                );
              })}
            </div>
          )}

          {/* Explanation */}
          {showExplanation && (
            <div className={`p-4 rounded-lg border ${
              isCorrect 
                ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                : 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
            }`}>
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-red-600 mt-0.5" />
                )}
                <div>
                  <h4 className={`font-medium mb-2 ${
                    isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                  }`}>
                    {isCorrect ? 'Excellent!' : 'Not quite right'}
                  </h4>
                  <p className={`caption-lg ${
                    isCorrect ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500'
                  }`}>
                    {currentQuestion.explanation}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Target className="w-4 h-4" />
          <span className="caption-lg">Progress: {currentQuestionIndex + 1}/{questions.length}</span>
        </div>
        
        <div className="flex gap-3">
          {!isAnswered && (
            <Button 
              onClick={handleSubmitAnswer}
              disabled={!selectedAnswer}
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Check Answer
            </Button>
          )}
          
          {isAnswered && (
            <Button 
              onClick={handleNextQuestion}
              className="flex items-center gap-2"
            >
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}