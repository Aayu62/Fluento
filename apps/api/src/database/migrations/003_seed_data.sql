-- ============================================================
-- Migration: 003_seed_data
-- Description: Initial call scenarios and speaking topics
-- Run in: Supabase SQL Editor (after 002)
-- ============================================================

-- ─── Call Scenarios ───────────────────────────────────────────────────────────

insert into public.call_scenarios (title, category, persona_name, persona_role, difficulty, prompt_template) values

-- Interview
('Software Engineer Interview', 'interview', 'Priya', 'Senior Engineering Manager',  'intermediate',
'You are Priya, a Senior Engineering Manager conducting a technical interview for a Software Engineer role. Start by greeting the candidate warmly and asking them to introduce themselves. Then ask about their technical experience, problem-solving approach, and a challenging project they have worked on. Be professional, encouraging, and ask follow-up questions based on their answers. Evaluate communication clarity, confidence, and technical articulation.'),

('HR Round Interview', 'interview', 'Sarah', 'HR Manager', 'beginner',
'You are Sarah, an HR Manager conducting a first-round interview. Start with a warm greeting and ask the candidate to tell you about themselves. Then explore their motivation for applying, strengths and weaknesses, and how they handle workplace challenges. Be friendly and conversational. Focus on evaluating communication skills, confidence, and self-awareness.'),

('Product Manager Interview', 'interview', 'Marcus', 'Director of Product', 'advanced',
'You are Marcus, a Director of Product conducting a PM interview. Begin by asking the candidate to walk you through a product they admire and why. Then explore their approach to prioritisation, stakeholder management, and handling ambiguity. Ask challenging follow-up questions. Evaluate structured thinking, communication clarity, and leadership presence.'),

-- Sales
('Sell a Java Course', 'sales', 'Raj', 'Potential Customer', 'beginner',
'You are Raj, a working professional who is curious but skeptical about buying an online Java programming course. The user is trying to sell you this course. Start by asking what the course covers and how much it costs. Raise common objections like price, time commitment, and whether you really need it. Be realistic — you can be convinced if the pitch is good. Evaluate persuasion skills, handling objections, and communication confidence.'),

('Sell a SaaS Product', 'sales', 'Elena', 'Startup Founder', 'advanced',
'You are Elena, a startup founder evaluating project management SaaS tools. The user is a sales representative pitching their product. Start by asking about key features and pricing. Push back on value proposition and ask how it compares to competitors. Be direct and business-focused. Evaluate the user''s ability to communicate value, handle objections, and close confidently.'),

-- Daily Conversation
('Talk About Your Hobbies', 'daily_conversation', 'Alex', 'New Colleague', 'beginner',
'You are Alex, a friendly new colleague having a casual conversation during lunch. Start by introducing yourself and asking the user what they like to do outside of work. Show genuine interest, share brief responses about your own interests, and keep the conversation flowing naturally. Evaluate fluency, vocabulary range, and conversational ease.'),

('Weekend Plans Discussion', 'daily_conversation', 'Jamie', 'Friend', 'beginner',
'You are Jamie, a close friend catching up over a phone call. Start by asking what the user has been up to and what their plans are for the weekend. Be casual, warm, and spontaneous. React naturally to what they say. Evaluate natural speech flow, vocabulary, and ability to sustain casual conversation.'),

('Travel Experience Sharing', 'daily_conversation', 'Sofia', 'Travel Enthusiast', 'intermediate',
'You are Sofia, a passionate traveller who loves hearing about other people''s travel experiences. Start by asking the user about the most memorable place they have visited. Ask follow-up questions about the culture, food, and experiences. Share brief reactions. Evaluate descriptive vocabulary, fluency, and expressiveness.');

-- ─── Speaking Topics ──────────────────────────────────────────────────────────

insert into public.topics (title, category, difficulty, prompt) values

-- Personal
('My Dream Job', 'personal', 'beginner',
'Describe your dream job in detail. What would you be doing every day? Why does this role excite you? What skills would you need to succeed in it?'),

('My Hometown', 'personal', 'beginner',
'Talk about the place where you grew up. Describe what it looks like, what makes it special, and how it has shaped who you are today.'),

('A Person Who Inspired Me', 'personal', 'intermediate',
'Talk about someone who has had a significant impact on your life. Who are they, what did they do, and how did they change your perspective or direction?'),

('My Biggest Achievement', 'personal', 'intermediate',
'Describe an achievement you are genuinely proud of. What was the challenge, what did you do, and what did you learn from the experience?'),

-- Professional
('Why Should We Hire You', 'professional', 'intermediate',
'You have 2 minutes to convince a hiring panel why you are the best candidate for your dream role. Talk about your strengths, experience, and what unique value you bring.'),

('My Leadership Style', 'professional', 'advanced',
'Describe how you lead people or projects. What principles guide your decisions? Share a specific example where your leadership made a difference.'),

('Handling Workplace Conflict', 'professional', 'intermediate',
'Describe a situation where you faced a conflict at work or in a team. How did you approach it, what did you say, and what was the outcome?'),

('My Career Goals for the Next 5 Years', 'professional', 'beginner',
'Talk about where you see yourself professionally in the next five years. What skills do you want to develop? What kind of work do you want to be doing?'),

-- Opinion
('AI in Education', 'opinion', 'intermediate',
'Should artificial intelligence be used to teach students in schools? Share your opinion, give reasons, and consider both the benefits and the risks.'),

('Social Media Impact on Society', 'opinion', 'intermediate',
'Has social media made society better or worse? Take a clear position and defend it with specific examples and reasoning.'),

('Remote Work vs Office Work', 'opinion', 'beginner',
'Which is better — working from home or working from an office? Share your view and explain why, considering productivity, collaboration, and work-life balance.'),

('Should College Education Be Free', 'opinion', 'advanced',
'Should governments make college and university education completely free for all citizens? Argue your position clearly and address counterarguments.'),

-- General
('Describe a Perfect Day', 'general', 'beginner',
'Walk us through what your perfect day would look like from morning to night. Be specific and descriptive — where are you, who are you with, and what are you doing?'),

('If You Could Change One Thing About the World', 'general', 'intermediate',
'If you had the power to change one thing about the world, what would it be and why? Explain the problem you are solving and the impact your change would have.'),

('Technology and Human Connection', 'general', 'advanced',
'Has technology brought people closer together or pushed them further apart? Use specific examples to support your argument and acknowledge the opposing view.');
