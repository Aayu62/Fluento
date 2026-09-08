import { Injectable, Logger } from '@nestjs/common';
import type { SessionScores, SessionType, ChallengeMode } from '@fluento/shared';

export interface EvaluationInput {
  sessionType: SessionType;
  userResponse: string;
  contextData: Record<string, unknown>;
  mode?: ChallengeMode;
}

export interface EvaluationResult {
  scores: SessionScores;
  feedback: string;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
}

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);
  private readonly aiServerUrl = process.env['AI_SERVER_URL'] || 'http://localhost:8000';

  async evaluate(input: EvaluationInput): Promise<EvaluationResult> {
    this.logger.log(`Evaluating ${input.sessionType} session via AI stack`);

    try {
      const prompt = `Evaluate the following ${input.sessionType} response in JSON format.
Response: "${input.userResponse}"
Context: ${JSON.stringify(input.contextData)}`;

      const response = await fetch(`${this.aiServerUrl}/llm/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          system_prompt: 'You are an expert communication evaluator. Output structured scores and feedback.',
        }),
      });

      if (response.ok) {
        const json = (await response.json()) as { response?: string };
        if (json.response) {
          try {
            const parsed = JSON.parse(json.response);
            if (parsed.scores && parsed.feedback) {
              return {
                scores: parsed.scores,
                feedback: parsed.feedback,
                strengths: parsed.strengths || this.buildStrengths(parsed.scores),
                improvements: parsed.improvements || this.buildImprovements(parsed.scores),
                recommendations: parsed.recommendations || this.buildRecommendations(input.sessionType),
              };
            }
          } catch {
            // Text response without JSON structure
          }
        }
      }
    } catch (err) {
      this.logger.warn(`AI Server evaluation unavailable, using deterministic fallback: ${(err as Error).message}`);
    }

    // Fallback deterministic evaluation
    const base = this.baseScores(input.sessionType);
    return {
      scores: base,
      feedback: this.buildFeedback(input.sessionType, base),
      strengths: this.buildStrengths(base),
      improvements: this.buildImprovements(base),
      recommendations: this.buildRecommendations(input.sessionType),
    };
  }

  private baseScores(sessionType: SessionType): SessionScores {
    if (sessionType === 'voice_call') {
      return { fluency: 68, grammar: 72, vocabulary: 65, confidence: 70 };
    }
    if (sessionType === 'image_study') {
      return { observation: 74, grammar: 70, vocabulary: 68, expressiveness: 65 };
    }
    return { fluency: 70, grammar: 68, vocabulary: 72, clarity: 66, argumentStrength: 64 };
  }

  private buildFeedback(sessionType: SessionType, scores: SessionScores): string {
    if (sessionType === 'voice_call') {
      return `Your conversation showed good engagement. Focus on reducing filler words and expanding vocabulary range for more impactful communication.`;
    }
    if (sessionType === 'image_study') {
      return `You identified the main elements well. Work on using more varied descriptive vocabulary and capturing the emotional atmosphere of the scene.`;
    }
    return `Your response demonstrated clear thinking. Strengthen your argument by providing specific examples and anticipating counterpoints.`;
  }

  private buildStrengths(scores: SessionScores): string[] {
    const strengths: string[] = [];
    const entries = Object.entries(scores) as [string, number][];
    const top = entries.sort((a, b) => b[1] - a[1]).slice(0, 2);
    const labels: Record<string, string> = {
      fluency: 'Natural speech flow',
      grammar: 'Grammatical accuracy',
      vocabulary: 'Vocabulary range',
      observation: 'Observational detail',
      expressiveness: 'Expressive language',
      confidence: 'Confident delivery',
      clarity: 'Clear communication',
      argumentStrength: 'Logical reasoning',
    };
    for (const [key] of top) {
      if (labels[key]) strengths.push(labels[key]);
    }
    return strengths;
  }

  private buildImprovements(scores: SessionScores): string[] {
    const improvements: string[] = [];
    const entries = Object.entries(scores) as [string, number][];
    const bottom = entries.sort((a, b) => a[1] - b[1]).slice(0, 2);
    const labels: Record<string, string> = {
      fluency: 'Reduce hesitations and filler words',
      grammar: 'Review tense consistency and article usage',
      vocabulary: 'Incorporate more varied and precise words',
      observation: 'Notice and describe secondary details',
      expressiveness: 'Add emotional depth to descriptions',
      confidence: 'Speak with more conviction and pace',
      clarity: 'Structure ideas more clearly',
      argumentStrength: 'Support claims with specific examples',
    };
    for (const [key] of bottom) {
      if (labels[key]) improvements.push(labels[key]);
    }
    return improvements;
  }

  private buildRecommendations(sessionType: SessionType): string[] {
    if (sessionType === 'voice_call') {
      return [
        'Practice a 2-minute self-introduction daily',
        'Record yourself speaking and review for filler words',
        'Try an Image Study to improve descriptive vocabulary',
      ];
    }
    if (sessionType === 'image_study') {
      return [
        'Practice describing scenes from memory',
        'Read editorial photography descriptions for vocabulary inspiration',
        'Try a Thought Exercise to build argument structure',
      ];
    }
    return [
      'Practice the debate mode to sharpen counterargument skills',
      'Read opinion articles and summarise the main argument aloud',
      'Schedule a Voice Call to apply your ideas in conversation',
    ];
  }
}
