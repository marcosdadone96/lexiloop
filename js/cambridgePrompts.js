/* Cambridge Assessment English AI exam prompts — official PET structure per level. */
const CambridgePrompts = (() => {
  function buildB1(topic) {
    const t = topic || 'Travel and Tourism';
    return `You are a certified Cambridge English B1 Preliminary (PET) exam writer. Create a complete, realistic B1 Preliminary practice exam on the topic "${t}".

CRITICAL: Reply ONLY with valid JSON. No markdown, no explanation, no preamble. Start with { and end with }.
CRITICAL: Every part of the exam must be ENTIRELY in English. No language mixing.
CRITICAL: Follow exactly the task types, part structure, and rubrics of the official Cambridge B1 Preliminary exam.

B1 LEVEL: PET vocabulary range. All common tenses (past simple, present perfect, past continuous, future forms). Comparatives, modals, conditionals (1st and 2nd). Common phrasal verbs. Topics: travel, health, environment, daily life, work, education. Topic focus: ${t}.

Create EXACTLY this JSON structure with real content (no placeholders):

{
  "topic": "${t}",
  "level": "B1",
  "lang": "en",
  "official": {
    "board": "Cambridge Assessment English",
    "certificate": "B1 Preliminary (PET)",
    "note": "Practice exam (AI-generated). Task types based on official Cambridge B1 Preliminary format."
  },
  "readingParts": [
    {
      "part": 1,
      "time": "45 minutes (Reading and Writing combined)",
      "instruction": "Part 1 – Reading\\nFor each question, choose the correct answer.\\nThe texts are short notices, messages and other material.\\n(5 short texts, one question each)",
      "items": [
        {"id": "r1", "text": "A short notice, sign, message or advert (15–25 words) related to ${t}.", "question": "What does this tell you?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "A"},
        {"id": "r2", "text": "Second short text about ${t}.", "question": "What is the writer's main message?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "B"},
        {"id": "r3", "text": "Third short text.", "question": "What should you do according to this notice?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "C"},
        {"id": "r4", "text": "Fourth short text.", "question": "What is the purpose of this message?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "A"},
        {"id": "r5", "text": "Fifth short text.", "question": "What information does this give?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "B"}
      ]
    },
    {
      "part": 2,
      "instruction": "Part 2 – Reading\\nThe people below all want to find information about ${t}.\\nOn the next page there are descriptions of eight resources / options (A–H).\\nDecide which resource would be the most suitable for each person.\\nFor questions 6–10, choose the correct letter (A–H).",
      "people": [
        {"id": "r6", "description": "Person 1: Brief description of their specific need related to ${t} (2–3 sentences)."},
        {"id": "r7", "description": "Person 2: Different specific need."},
        {"id": "r8", "description": "Person 3: Another need."},
        {"id": "r9", "description": "Person 4: Another need."},
        {"id": "r10", "description": "Person 5: Another need."}
      ],
      "options": [
        {"key": "A", "title": "Option A Title", "text": "Description of option A (30–50 words) – matches one person's needs exactly."},
        {"key": "B", "title": "Option B Title", "text": "Description B."},
        {"key": "C", "title": "Option C Title", "text": "Description C."},
        {"key": "D", "title": "Option D Title", "text": "Description D."},
        {"key": "E", "title": "Option E Title", "text": "Description E."},
        {"key": "F", "title": "Option F Title", "text": "Description F."},
        {"key": "G", "title": "Option G Title", "text": "Description G."},
        {"key": "H", "title": "Option H Title (distractor)", "text": "Description H – does not match any person."}
      ],
      "answers": {"r6": "C", "r7": "A", "r8": "E", "r9": "G", "r10": "D"}
    },
    {
      "part": 3,
      "instruction": "Part 3 – Reading\\nFor each question, choose the correct answer.\\nRead the following article about ${t}.",
      "textTitle": "Article title about ${t}",
      "text": "A magazine or newspaper article (250–300 words) about ${t} at B1 level. Informative, engaging, journalistic style. Contains specific details, examples and one or two quotes.",
      "questions": [
        {"id": "r11", "type": "multiple", "question": "11  What is the main purpose of this article?", "options": ["A) To advise readers how to...", "B) To explain why...", "C) To describe how...", "D) To compare different..."], "correct": "B"},
        {"id": "r12", "type": "multiple", "question": "12  According to the article, ...", "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"], "correct": "A"},
        {"id": "r13", "type": "multiple", "question": "13  The writer suggests that ...", "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"], "correct": "C"},
        {"id": "r14", "type": "multiple", "question": "14  What does the writer mean by '...' in paragraph ...?", "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"], "correct": "D"},
        {"id": "r15", "type": "multiple", "question": "15  How does the writer feel about ${t}?", "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"], "correct": "B"}
      ]
    },
    {
      "part": 4,
      "instruction": "Part 4 – Reading\\nFor each question, choose the correct answer A, B, C or D.\\nRead the following text in which five people talk about their experience with ${t}.",
      "textTitle": "Five people share their views on ${t}",
      "speakers": [
        {"name": "Alice", "text": "Alice's opinion (50–70 words). Clear viewpoint on ${t}."},
        {"name": "Ben", "text": "Ben's opinion. Different viewpoint."},
        {"name": "Clara", "text": "Clara's opinion. Another angle."},
        {"name": "David", "text": "David's opinion. Contrasting view."},
        {"name": "Elena", "text": "Elena's opinion. Nuanced take."}
      ],
      "questions": [
        {"id": "r16", "type": "multiple", "question": "16  Which person had an unexpected experience with ${t}?", "options": ["A) Alice", "B) Ben", "C) Clara", "D) David"], "correct": "B"},
        {"id": "r17", "type": "multiple", "question": "17  Which two people share a similar positive view?", "options": ["A) Alice and Clara", "B) Ben and Elena", "C) Clara and David", "D) Alice and David"], "correct": "A"},
        {"id": "r18", "type": "multiple", "question": "18  Who changed their mind about ${t}?", "options": ["A) Alice", "B) Clara", "C) Elena", "D) David"], "correct": "C"},
        {"id": "r19", "type": "multiple", "question": "19  What does Ben suggest about ${t}?", "options": ["A) Option A", "B) Option B", "C) Option C", "D) Option D"], "correct": "D"},
        {"id": "r20", "type": "multiple", "question": "20  Which person recommends ${t} to others?", "options": ["A) Alice", "B) Ben", "C) David", "D) Elena"], "correct": "D"}
      ]
    }
  ],
  "listeningParts": [
    {
      "part": 1,
      "plays": 2,
      "instruction": "Part 1 – Listening\\nFor each question, choose the correct answer.\\nYou will hear seven short recordings.",
      "segments": [
        {"id": "l1", "question": "1  What will the weather be like tomorrow?", "transcript": "Short conversation (40–60 words) about ${t}. Natural spoken English.", "options": ["A) Sunny", "B) Rainy", "C) Cloudy"], "correct": "B"},
        {"id": "l2", "question": "2  Where will they meet?", "transcript": "Short dialogue.", "options": ["A) The library", "B) The park", "C) The cafe"], "correct": "C"},
        {"id": "l3", "question": "3  What did the man buy?", "transcript": "Short monologue or dialogue.", "options": ["A) A book", "B) A bag", "C) A jacket"], "correct": "A"},
        {"id": "l4", "question": "4  When does the course start?", "transcript": "Short recording.", "options": ["A) Monday", "B) Wednesday", "C) Friday"], "correct": "B"},
        {"id": "l5", "question": "5  What is the woman's job?", "transcript": "Short conversation.", "options": ["A) Teacher", "B) Doctor", "C) Engineer"], "correct": "C"},
        {"id": "l6", "question": "6  How much does it cost?", "transcript": "Short dialogue.", "options": ["A) 12 euros", "B) 15 euros", "C) 20 euros"], "correct": "A"},
        {"id": "l7", "question": "7  What problem does she have?", "transcript": "Short monologue or dialogue.", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "B"}
      ]
    },
    {
      "part": 2,
      "plays": 2,
      "instruction": "Part 2 – Listening\\nFor each question, choose the correct answer.\\nYou will hear a conversation between two people about ${t}.",
      "context": "Two friends / colleagues talking about ${t}.",
      "transcript": "A natural conversation (150–200 words) between two people about ${t}. Informal register. Contains specific information that the questions test.",
      "questions": [
        {"id": "l8", "type": "multiple", "question": "8  What do they agree about?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "A"},
        {"id": "l9", "type": "multiple", "question": "9  Why does the man / woman say ...?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "C"},
        {"id": "l10", "type": "multiple", "question": "10  What will they do next?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "B"},
        {"id": "l11", "type": "multiple", "question": "11  What is the woman / man's opinion?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "A"},
        {"id": "l12", "type": "multiple", "question": "12  What fact do they mention about ${t}?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "C"}
      ]
    },
    {
      "part": 3,
      "plays": 2,
      "instruction": "Part 3 – Listening\\nFor each question, write the missing information in the numbered space.\\nYou will hear a monologue about ${t}.",
      "context": "You will hear information about ${t}. Complete the notes below.",
      "transcript": "An informative monologue (200–250 words) about ${t}. Clear speaker, moderate pace. Contains specific information (names, dates, numbers, places) that fills gaps in the notes.",
      "notes": {
        "title": "Notes: ${t}",
        "fields": [
          {"id": "l13", "label": "Name / Title:", "answer": "Specific answer from transcript"},
          {"id": "l14", "label": "Date / Time:", "answer": "Specific date or time"},
          {"id": "l15", "label": "Location:", "answer": "Place name"},
          {"id": "l16", "label": "Cost / Price:", "answer": "Amount"},
          {"id": "l17", "label": "Contact / Website:", "answer": "Details"},
          {"id": "l18", "label": "Important note:", "answer": "Key piece of information"}
        ]
      }
    },
    {
      "part": 4,
      "plays": 2,
      "instruction": "Part 4 – Listening\\nFor each question, choose the correct answer.\\nYou will hear an interview with someone who has experience with ${t}.",
      "context": "A radio interview with an expert or enthusiast about ${t}.",
      "transcript": "A radio interview (200–250 words). Interviewer and one guest. Guest talks about personal experience, opinions and advice related to ${t}.",
      "questions": [
        {"id": "l19", "type": "multiple", "question": "19  How did the speaker first become interested in ${t}?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "B"},
        {"id": "l20", "type": "multiple", "question": "20  What does the speaker say is the main challenge?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "A"},
        {"id": "l21", "type": "multiple", "question": "21  What advice does the speaker give?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "C"},
        {"id": "l22", "type": "multiple", "question": "22  What is the speaker's view on the future of ${t}?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "B"},
        {"id": "l23", "type": "multiple", "question": "23  What does the interviewer find surprising?", "options": ["A) Option A", "B) Option B", "C) Option C"], "correct": "A"}
      ]
    }
  ],
  "writingParts": [
    {
      "part": 1,
      "time": "45 minutes (Reading and Writing combined)",
      "fieldId": "write1",
      "instruction": "Part 1 – Writing\\nYour English friend has written to you about ${t}. Write a reply to your friend.\\nIn your email:\\n- Thank them for their message\\n- Answer their question about ${t}\\n- Suggest something you could do together related to ${t}\\nWrite 100 words.",
      "promptEmail": "Hey! I've been thinking a lot about ${t} lately. What do you think about it? Have you had any experience with it? I'd love to know your opinion!\\n\\nBest,\\n[Friend's name]",
      "minWords": 100,
      "criteria": ["Content (all three points addressed)", "Communicative achievement (appropriate register)", "Organisation (logical structure)", "Language (range and accuracy)"],
      "modelAnswer": "Dear [Name],\\n\\nThanks so much for your email – great to hear from you!\\n\\nHonestly, I find ${t} really interesting. I [personal experience or opinion]. In my view, [answer to question].\\n\\nWhy don't we [suggestion related to ${t}]? I think it would be really fun. Let me know what you think!\\n\\nLooking forward to hearing from you,\\n[Name]",
      "feedback": ["Informal but correct register", "All three points covered", "Natural linking words", "100 words approx."]
    },
    {
      "part": 2,
      "fieldId": "write2",
      "instruction": "Part 2 – Writing\\nChoose ONE of the following tasks. Write about 100 words.\\n\\nOption A: Article\\nYou see this notice in your school magazine:\\n'We want articles about ${t}. Tell us your experience and give your opinion.'\\nWrite your article.\\n\\nOption B: Story\\nYour English teacher has asked you to write a story beginning with:\\n'It was the first time I had ever [done something related to ${t}], and I was very nervous.'\\nWrite your story.",
      "minWords": 100,
      "options": ["article", "story"],
      "criteria": ["Content and task achievement", "Communicative achievement", "Organisation", "Language range and accuracy"],
      "modelAnswerArticle": "${t}: My Experience\\n\\nI first became interested in ${t} when I was [age/time]. At first, I wasn't sure about it, but then [development].\\n\\nI think ${t} is important because [reason 1]. Furthermore, [reason 2]. However, not everyone agrees – some people feel that [counterargument].\\n\\nIn my opinion, [conclusion]. If you haven't tried it yet, I strongly recommend it!",
      "feedback": ["Clear topic sentence", "Personal experience included", "Opinion stated clearly", "100 words approx."]
    }
  ],
  "speakingParts": [
    {
      "part": 1,
      "title": "Interview",
      "duration": "2–3 minutes",
      "fieldId": "speak1",
      "situation": "Part 1 – Speaking\\nThe examiner will ask you some questions about yourself and general topics.",
      "examinerQuestions": [
        "What's your name and where are you from?",
        "Can you tell me about your experience with ${t}?",
        "How important is ${t} in your daily life?",
        "What do you enjoy most about ${t}?",
        "Is ${t} popular in your country? Why / Why not?"
      ],
      "modelAnswer": "My name is [Name] and I'm from [country]. I first got interested in ${t} when [experience]. I think it's quite important because [reason]. What I enjoy most is [aspect]. In my country, [description of popularity].",
      "feedback": ["Full sentence answers", "Give reasons and examples", "Ask for clarification if needed"]
    },
    {
      "part": 2,
      "title": "Discussion",
      "duration": "2–3 minutes",
      "fieldId": "speak2",
      "situation": "Part 2 – Speaking\\nLook at the photographs together. They show different aspects of ${t}.\\n\\nFirst, talk to each other about what you can see in the photographs.\\nThen decide which photograph best represents ${t} today.",
      "photoDescriptions": [
        "Photo A: [Description of a scene related to ${t}]",
        "Photo B: [Description of a contrasting scene related to ${t}]",
        "Photo C: [Description of another aspect of ${t}]"
      ],
      "points": ["Describe what you see", "Compare the photos", "Give your opinion", "Reach a decision"],
      "minExchanges": 4,
      "modelAnswer": "Candidate A: In the first photo, I can see... I think this represents ${t} because...\\nCandidate B: Yes, I agree, but photo B shows a different side. Here we can see...\\nCandidate A: That's interesting. Personally, I think photo [X] is the most representative because...\\nCandidate B: I see what you mean. Shall we go with that one?",
      "feedback": ["Describe and speculate", "Agree and disagree politely", "Reach a joint decision"]
    }
  ]
}`;
  }

  return { buildB1 };
})();
