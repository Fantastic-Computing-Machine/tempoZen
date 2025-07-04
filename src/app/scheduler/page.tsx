"use client";
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { BrainCircuit, CalendarPlus, Loader2, MessageSquareText, CheckCircle2 } from 'lucide-react';
import { scheduleMeetingFromNotes, ScheduleMeetingOutput } from '@/ai/flows/schedule-meeting-from-notes';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function SchedulerPage() {
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<ScheduleMeetingOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) {
      toast({
        title: "Input Required",
        description: "Please enter some notes to analyze.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setSuggestion(null);
    setError(null);
    try {
      const result = await scheduleMeetingFromNotes({ notes });
      setSuggestion(result);
      toast({
        title: "Suggestion Ready!",
        description: "AI has proposed a meeting schedule.",
      });
    } catch (err) {
      console.error("Error scheduling meeting:", err);
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(`Failed to get suggestion: ${errorMessage}`);
      toast({
        title: "Error",
        description: `Failed to get suggestion: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl">AI Meeting Scheduler</h1>
        <p className="text-muted-foreground text-lg">Let AI help you find the best time for your meetings based on your notes.</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Analyze Your Notes</CardTitle>
            <CardDescription>Paste your meeting notes, task details, or any relevant text below. The AI will suggest an optimal meeting time.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="notes-input" className="text-base">Your Notes</Label>
              <Textarea
                id="notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Project Alpha kickoff meeting with Jane, John, and marketing team. Need to discuss Q3 roadmap. Availability: Jane is OOO next Monday. John prefers mornings..."
                className="min-h-[200px] mt-1 text-base"
                rows={10}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading} size="lg">
              {isLoading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <BrainCircuit className="mr-2 h-5 w-5" />
              )}
              {isLoading ? 'Analyzing...' : 'Get Suggestion'}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {suggestion && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl flex items-center">
                <CheckCircle2 className="mr-2 h-7 w-7 text-green-500" />
                AI Suggestion
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold text-lg text-primary flex items-center">
                <CalendarPlus className="mr-2 h-5 w-5" />
                Suggested Date & Time
              </h3>
              <p className="text-2xl font-bold">
                {suggestion.suggestedDate} at {suggestion.suggestedTime}
              </p>
            </div>
            <div className="p-4 bg-secondary/20 rounded-lg">
                <h3 className="font-semibold text-lg text-secondary-foreground flex items-center">
                    <MessageSquareText className="mr-2 h-5 w-5" />
                    Reasoning
                </h3>
                <p className="text-muted-foreground whitespace-pre-wrap">{suggestion.reasoning}</p>
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground">
              Remember, this is an AI suggestion. Please verify availability with all participants.
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
