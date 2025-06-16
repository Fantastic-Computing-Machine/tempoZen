'use server';
/**
 * @fileOverview An AI agent that schedules meetings based on notes.
 *
 * - scheduleMeetingFromNotes - A function that analyzes notes and suggests optimal meeting times.
 * - ScheduleMeetingInput - The input type for the scheduleMeetingFromNotes function.
 * - ScheduleMeetingOutput - The return type for the scheduleMeetingFromNotes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ScheduleMeetingInputSchema = z.object({
  notes: z
    .string()
    .describe(
      'The notes to analyze for scheduling a meeting. Include all relevant details about the task, people involved, and context.'
    ),
});
export type ScheduleMeetingInput = z.infer<typeof ScheduleMeetingInputSchema>;

const ScheduleMeetingOutputSchema = z.object({
  suggestedDate: z
    .string()
    .describe(
      'The suggested date for the meeting, in ISO 8601 format (YYYY-MM-DD).'
    ),
  suggestedTime: z
    .string()
    .describe('The suggested time for the meeting, in HH:MM format (24-hour clock).'),
  reasoning: z
    .string()
    .describe(
      'The AI reasoning behind the suggested date and time, including the factors considered from the notes.'
    ),
});
export type ScheduleMeetingOutput = z.infer<typeof ScheduleMeetingOutputSchema>;

export async function scheduleMeetingFromNotes(
  input: ScheduleMeetingInput
): Promise<ScheduleMeetingOutput> {
  return scheduleMeetingFromNotesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'scheduleMeetingFromNotesPrompt',
  input: {schema: ScheduleMeetingInputSchema},
  output: {schema: ScheduleMeetingOutputSchema},
  prompt: `You are an AI assistant that analyzes notes and suggests the optimal date and time for scheduling a meeting.

  Consider the following notes:
  {{notes}}

  Based on these notes, suggest a date and time for the meeting.
  Return the date in YYYY-MM-DD format and the time in HH:MM format (24-hour clock).
  Also, explain your reasoning for choosing the suggested date and time.
  Make sure the time is in the future.`,
});

const scheduleMeetingFromNotesFlow = ai.defineFlow(
  {
    name: 'scheduleMeetingFromNotesFlow',
    inputSchema: ScheduleMeetingInputSchema,
    outputSchema: ScheduleMeetingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
