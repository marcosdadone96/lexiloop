/* Goethe-Institut AI exam prompts ù official Modellsatz structures per level. */
const GoethePrompts = (() => {
  function buildA1(topic) {
    const t = topic || 'Alltag und Familie';
    return `Du bist Pruefungsautor beim Goethe-Institut und erstellst einen vollstaendigen Modellsatz fuer das Goethe-Zertifikat A1 (Start Deutsch 1) zum Thema "${t}".

KRITISCH: Antworte NUR mit gueltigem JSON. Kein Markdown, keine Erklaerung, kein Praambel. Beginne mit { und ende mit }.

KRITISCH: Der gesamte Pruefungsinhalt (Texte, Fragen, Aufgaben) muss auf DEUTSCH sein, ausser den Situationsbeschreibungen fuer Hoeren (kurze Kontextsaetze auf Englisch erlaubt).

KRITISCH: Halte dich genau an die Aufgabentypen und Strukturen des offiziellen Start Deutsch 1 Modellsatzes.

SPRACHNIVEAU A1: Nur Grundwortschatz. Praesens und Perfekt. Saetze unter 12 Woerter. Themen: Begruessung, Familie, Zahlen, Farben, Essen, Wohnen, alltaegliche Situationen. Bezug zum Thema "${t}".

Erstelle EXAKT folgende JSON-Struktur mit echtem Inhalt (keine Platzhalter):

{
  "topic": "${t}",
  "level": "A1",
  "lang": "de",
  "goetheFormat": true,
  "official": {
    "board": "Goethe-Institut",
    "certificate": "Start Deutsch 1",
    "note": "Modellsatz (KI-generiert). Aufgabentypen basieren auf dem offiziellen Goethe-Zertifikat A1."
  },
  "modules": {
    "lesen": { "title": "Lesen", "time": "25 Minuten" },
    "horen": { "title": "Hoeren", "time": "ca. 20 Minuten" },
    "schreiben": { "title": "Schreiben", "time": "20 Minuten" },
    "sprechen": { "title": "Sprechen", "time": "ca. 15 Minuten" }
  },
  "lesenParts": [
    {
      "teil": 1,
      "arbeitszeit": "5 Minuten",
      "instruction": "Teil 1 ù Lesen\\nLesen Sie die fuenf Texte. Waehlen Sie bei jeder Aufgabe die richtige Antwort: a, b oder c.",
      "items": [
        { "id": "l1", "signText": "...", "question": "Was bedeutet das?", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a" },
        { "id": "l2", "signText": "...", "question": "Was bedeutet das?", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b" },
        { "id": "l3", "signText": "...", "question": "Was bedeutet das?", "options": ["a) ...", "b) ...", "c) ..."], "correct": "c" },
        { "id": "l4", "signText": "...", "question": "Was bedeutet das?", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a" },
        { "id": "l5", "signText": "...", "question": "Was bedeutet das?", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b" }
      ]
    },
    {
      "teil": 2,
      "arbeitszeit": "8 Minuten",
      "instruction": "Teil 2 ù Lesen\\nLesen Sie den Text und die Aufgaben 6 bis 10.\\nSchreiben Sie: Richtig oder Falsch.",
      "textTitle": "...",
      "text": "Ein einfacher Alltagstext (ca. 80 Woerter, A1) zu ${t}.",
      "questions": [
        { "id": "l6", "type": "rf", "question": "6  ...", "correct": "R" },
        { "id": "l7", "type": "rf", "question": "7  ...", "correct": "F" },
        { "id": "l8", "type": "rf", "question": "8  ...", "correct": "R" },
        { "id": "l9", "type": "rf", "question": "9  ...", "correct": "F" },
        { "id": "l10", "type": "rf", "question": "10  ...", "correct": "R" }
      ]
    }
  ],
  "horenParts": [
    {
      "teil": 1,
      "plays": 2,
      "instruction": "Hoeren Teil 1\\nSie hoeren fuenf kurze Texte. Sie hoeren jeden Text zweimal.\\nWaehlen Sie bei jeder Aufgabe die richtige Antwort: a, b oder c.",
      "segments": [
        { "id": "h1", "label": "Text 1", "transcript": "...", "question": "Worum geht es?", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a" },
        { "id": "h2", "label": "Text 2", "transcript": "...", "question": "Was soll die Person tun?", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b" },
        { "id": "h3", "label": "Text 3", "transcript": "...", "question": "Was ist das Thema?", "options": ["a) ...", "b) ...", "c) ..."], "correct": "c" },
        { "id": "h4", "label": "Text 4", "transcript": "...", "question": "Was passiert?", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a" },
        { "id": "h5", "label": "Text 5", "transcript": "...", "question": "Wer spricht?", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b" }
      ]
    },
    {
      "teil": 2,
      "plays": 2,
      "instruction": "Hoeren Teil 2\\nSie hoeren ein Gespraech. Sie hoeren das Gespraech zweimal.\\nKreuzen Sie an: Richtig oder Falsch.",
      "context": "Context in English: Two people are talking about ${t}.",
      "transcript": "Kurzes Gespraech A: B: (ca. 80 Woerter, A1).",
      "questions": [
        { "id": "h6", "type": "rf", "question": "6  ...", "correct": "R" },
        { "id": "h7", "type": "rf", "question": "7  ...", "correct": "F" },
        { "id": "h8", "type": "rf", "question": "8  ...", "correct": "R" },
        { "id": "h9", "type": "rf", "question": "9  ...", "correct": "R" },
        { "id": "h10", "type": "rf", "question": "10  ...", "correct": "F" }
      ]
    }
  ],
  "schreibenParts": [
    {
      "aufgabe": 1,
      "arbeitszeit": "20 Minuten",
      "fieldId": "write1",
      "task": "Aufgabe 1 ù Schreiben\\nFuellen Sie das Formular aus.\\n\\nSie moechten an einem Deutschkurs teilnehmen.",
      "formFields": ["Vorname", "Nachname", "Geburtsdatum", "Nationalitaet", "E-Mail", "Kursbeginn (Wunsch)"],
      "minWords": 0,
      "criteria": ["Vollstaendigkeit", "Inhaltliche Korrektheit", "Lesbarkeit"],
      "modelAnswer": "Vorname: ...\\nNachname: ...",
      "feedback": ["Alle Felder ausgefuellt", "Korrektes Datumsformat", "Leserliche Schrift"]
    },
    {
      "aufgabe": 2,
      "arbeitszeit": "15 Minuten",
      "fieldId": "write2",
      "task": "Aufgabe 2 ù Schreiben\\nSchreiben Sie eine kurze Nachricht (ca. 30 Woerter).\\n\\nIhr Freund / Ihre Freundin fragt, wann Sie Zeit haben.",
      "minWords": 30,
      "criteria": ["Inhalt (alle 3 Punkte)", "Verstaendlichkeit", "Einfache Korrektheit"],
      "modelAnswer": "...",
      "feedback": ["Alle 3 Punkte erwaehnt", "Verstaendliche Nachricht", "Anrede vorhanden"]
    }
  ],
  "sprechenParts": [
    {
      "teil": 1,
      "title": "Sich vorstellen",
      "dauer": "ca. 3 Minuten",
      "fieldId": "speak1",
      "situation": "Teil 1 ù Sprechen\\nStellen Sie sich vor. Beantworten Sie die Fragen des Pruefers.",
      "prompts": ["Wie heissen Sie?", "Woher kommen Sie?", "Wo wohnen Sie?", "Was machen Sie?", "Welche Sprachen sprechen Sie?"],
      "modelAnswer": "Ich heisse ... Ich komme aus ...",
      "feedback": ["Vollstaendige Antworten", "Verstaendliche Saetze", "Einfache Struktur"]
    },
    {
      "teil": 2,
      "title": "Bitten und Reagieren",
      "dauer": "ca. 3 Minuten",
      "fieldId": "speak2",
      "situation": "Teil 2 ù Sprechen\\nReagieren Sie auf den Vorschlag / die Bitte. Machen Sie auch selbst Vorschlaege.",
      "cardText": "Alltagssituation zu ${t} (z.B. im Cafe, im Laden, unterwegs)",
      "points": ["Ja/Nein sagen", "Einen Vorschlag machen", "Fragen stellen"],
      "minExchanges": 3,
      "modelAnswer": "Pruefer: ...\\nIch: ...",
      "feedback": ["Auf Fragen reagieren", "Einfache Saetze", "Hoeflich antworten"]
    }
  ]
}`;
  }

  function buildB1(topic) {
    const t = topic || 'Umwelt und Gesundheit';
    return `Du bist Pruefungsautor beim Goethe-Institut und erstellst einen vollstaendigen Modellsatz fuer das Goethe-Zertifikat B1 zum Thema "${t}".

KRITISCH: Antworte NUR mit gueltigem JSON. Kein Markdown, keine Erklaerung. Beginne mit { und ende mit }.
KRITISCH: Saemtlicher Pruefungsinhalt muss auf AUTHENTISCHEM DEUTSCH sein. Keine gemischten Sprachen (ausser kurze Hoeren-Kontextsaetze auf Englisch).
KRITISCH: Befolge exakt die Aufgabentypen, Teilstrukturen und Anweisungen des offiziellen Goethe-Zertifikats B1 Modellsatzes.

SPRACHNIVEAU B1: Alle gaengigen Zeitformen inkl. Konjunktiv II. Haupt- und Nebensùtze. Konnektoren (obwohl, damit, weil, wenn, seit, waehrend). Wortschatz aus Goethe B1-Wortliste. Themenbezug: ${t}.

Erstelle EXAKT diese JSON-Struktur mit echtem Inhalt (keine Platzhalter):

{
  "topic": "${t}",
  "level": "B1",
  "lang": "de",
  "goetheFormat": true,
  "official": {
    "board": "Goethe-Institut",
    "certificate": "Goethe-Zertifikat B1",
    "note": "Modellsatz (KI-generiert). Struktur nach offiziellem Goethe-Zertifikat B1."
  },
  "modules": {
    "lesen": { "title": "Lesen", "time": "65 Minuten" },
    "horen": { "title": "Hoeren", "time": "40 Minuten" },
    "schreiben": { "title": "Schreiben", "time": "60 Minuten" },
    "sprechen": { "title": "Sprechen", "time": "15 Minuten (zwei Teilnehmende)" }
  },
  "lesenParts": [
    {
      "teil": 1,
      "arbeitszeit": "10 Minuten",
      "instruction": "Teil 1 ù Lesen\\nLesen Sie den Text und die Aufgaben 1 bis 6 dazu.\\nSchreiben Sie: Richtig oder Falsch.",
      "textTitle": "Titel: Blog oder Forumsbeitrag zu ${t}",
      "text": "Persoenlicher Text auf Deutsch (180-220 Woerter, B1) zu ${t}. Erste Person.",
      "questions": [
        {"id": "l1", "type": "rf", "question": "1  ...", "correct": "R"},
        {"id": "l2", "type": "rf", "question": "2  ...", "correct": "F"},
        {"id": "l3", "type": "rf", "question": "3  ...", "correct": "R"},
        {"id": "l4", "type": "rf", "question": "4  ...", "correct": "F"},
        {"id": "l5", "type": "rf", "question": "5  ...", "correct": "R"},
        {"id": "l6", "type": "rf", "question": "6  ...", "correct": "F"}
      ]
    },
    {
      "teil": 2,
      "arbeitszeit": "20 Minuten",
      "instruction": "Teil 2 ù Lesen\\nLesen Sie den Text aus der Presse und die Aufgaben 7 bis 12 dazu.\\nWaehlen Sie a, b oder c.",
      "textTitle": "Presseartikel zu ${t}",
      "text": "Journalistischer Text (200-260 Woerter, B1) zu ${t}.",
      "questions": [
        {"id": "l7", "type": "multiple", "question": "7  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"},
        {"id": "l8", "type": "multiple", "question": "8  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"},
        {"id": "l9", "type": "multiple", "question": "9  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "c"},
        {"id": "l10", "type": "multiple", "question": "10  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"},
        {"id": "l11", "type": "multiple", "question": "11  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"},
        {"id": "l12", "type": "multiple", "question": "12  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "c"}
      ]
    },
    {
      "teil": 3,
      "arbeitszeit": "10 Minuten",
      "instruction": "Teil 3 ù Lesen\\nSituationen 13-17, Anzeigen A-F. Jede Anzeige einmal. Eine passt nicht (0).",
      "ads": [
        {"key": "A", "title": "...", "text": "..."},
        {"key": "B", "title": "...", "text": "..."},
        {"key": "C", "title": "...", "text": "..."},
        {"key": "D", "title": "...", "text": "..."},
        {"key": "E", "title": "...", "text": "..."},
        {"key": "F", "title": "...", "text": "..."}
      ],
      "questions": [
        {"id": "l13", "type": "match", "question": "13  ...", "options": ["A", "B", "C", "D", "E", "0"], "correct": "A"},
        {"id": "l14", "type": "match", "question": "14  ...", "options": ["A", "B", "C", "D", "E", "0"], "correct": "C"},
        {"id": "l15", "type": "match", "question": "15  ...", "options": ["A", "B", "C", "D", "E", "0"], "correct": "B"},
        {"id": "l16", "type": "match", "question": "16  ...", "options": ["A", "B", "C", "D", "E", "0"], "correct": "D"},
        {"id": "l17", "type": "match", "question": "17  ...", "options": ["A", "B", "C", "D", "E", "0"], "correct": "E"}
      ]
    },
    {
      "teil": 4,
      "arbeitszeit": "10 Minuten",
      "instruction": "Teil 4 ù Lesen\\nMeinungen 18-22. Ja (dafuer) oder Nein (dagegen).",
      "textTitle": "Leserbriefe zu ${t}",
      "text": "Fuenf Meinungen (je 20-35 Woerter) verschiedener Personen zu ${t}.",
      "questions": [
        {"id": "l18", "type": "yn", "question": "18  Name", "correct": "J"},
        {"id": "l19", "type": "yn", "question": "19  Name", "correct": "N"},
        {"id": "l20", "type": "yn", "question": "20  Name", "correct": "J"},
        {"id": "l21", "type": "yn", "question": "21  Name", "correct": "N"},
        {"id": "l22", "type": "yn", "question": "22  Name", "correct": "J"}
      ]
    },
    {
      "teil": 5,
      "arbeitszeit": "10 Minuten",
      "instruction": "Teil 5 ù Lesen\\nAufgaben 23-27. Waehlen Sie a, b oder c.",
      "textTitle": "Hausordnung / Merkblatt zu ${t}",
      "text": "Offizieller Text (120-150 Woerter, B1) mit Regeln zu ${t}.",
      "questions": [
        {"id": "l23", "type": "multiple", "question": "23  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"},
        {"id": "l24", "type": "multiple", "question": "24  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"},
        {"id": "l25", "type": "multiple", "question": "25  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "c"},
        {"id": "l26", "type": "multiple", "question": "26  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"},
        {"id": "l27", "type": "multiple", "question": "27  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"}
      ]
    }
  ],
  "horenParts": [
    {
      "teil": 1,
      "plays": 2,
      "instruction": "Hoeren Teil 1\\nZwei kurze Texte, zweimal. Waehlen Sie die richtige Loesung.",
      "segments": [
        {
          "label": "Text 1: Anrufbeantworter",
          "transcript": "Kurzer Text (60-80 Woerter, B1) zu ${t}.",
          "questions": [
            {"id": "h1", "type": "rf", "question": "1  ...", "correct": "R"},
            {"id": "h2", "type": "multiple", "question": "2  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"}
          ]
        },
        {
          "label": "Text 2: Durchsage",
          "transcript": "Radioansage (60-80 Woerter) zu ${t}.",
          "questions": [
            {"id": "h3", "type": "rf", "question": "3  ...", "correct": "F"},
            {"id": "h4", "type": "multiple", "question": "4  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"}
          ]
        }
      ]
    },
    {
      "teil": 2,
      "plays": 1,
      "instruction": "Hoeren Teil 2\\nLaengerer Text, einmal. Waehlen Sie a, b oder c.",
      "context": "Context in English: guided tour / presentation about ${t}.",
      "transcript": "Laengerer Text (150-200 Woerter, B1) zu ${t}.",
      "questions": [
        {"id": "h5", "type": "multiple", "question": "5  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "c"},
        {"id": "h6", "type": "multiple", "question": "6  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"},
        {"id": "h7", "type": "multiple", "question": "7  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"}
      ]
    },
    {
      "teil": 3,
      "plays": 1,
      "instruction": "Hoeren Teil 3\\nGespraech, einmal. Richtig oder Falsch.",
      "context": "Context in English: conversation about ${t}.",
      "transcript": "Gespraech A: B: (150-180 Woerter, B1) zu ${t}.",
      "questions": [
        {"id": "h8", "type": "rf", "question": "8  ...", "correct": "R"},
        {"id": "h9", "type": "rf", "question": "9  ...", "correct": "F"},
        {"id": "h10", "type": "rf", "question": "10  ...", "correct": "R"},
        {"id": "h11", "type": "rf", "question": "11  ...", "correct": "F"}
      ]
    },
    {
      "teil": 4,
      "plays": 2,
      "instruction": "Hoeren Teil 4\\nDiskussion, zweimal. Wer sagt was? M / F / H.",
      "context": "Context in English: radio discussion about ${t}.",
      "speakers": ["Moderator/in", "Gast 1", "Gast 2"],
      "transcript": "Diskussion (180-220 Woerter, B1) zu ${t}.",
      "questions": [
        {"id": "h12", "type": "match", "question": "12  ...", "options": ["M", "F", "H"], "correct": "F"},
        {"id": "h13", "type": "match", "question": "13  ...", "options": ["M", "F", "H"], "correct": "H"},
        {"id": "h14", "type": "match", "question": "14  ...", "options": ["M", "F", "H"], "correct": "F"},
        {"id": "h15", "type": "match", "question": "15  ...", "options": ["M", "F", "H"], "correct": "M"}
      ]
    }
  ],
  "schreibenParts": [
    {
      "aufgabe": 1,
      "arbeitszeit": "20 Minuten",
      "fieldId": "write1",
      "task": "Aufgabe 1 ù E-Mail ca. 80 Woerter zu ${t}. Drei Inhaltspunkte.",
      "minWords": 80,
      "criteria": ["Inhalt", "Kommunikative Gestaltung", "Formale Richtigkeit"],
      "modelAnswer": "...",
      "feedback": ["Anrede und Schluss", "Alle 3 Punkte", "Ca. 80 Woerter"]
    },
    {
      "aufgabe": 2,
      "arbeitszeit": "25 Minuten",
      "fieldId": "write2",
      "task": "Aufgabe 2 ù Meinung ca. 80 Woerter. Zitat aus Forum zu ${t}.",
      "minWords": 80,
      "criteria": ["Klare Meinung", "Mindestens 2 Argumente", "Bezug zum Zitat"],
      "modelAnswer": "...",
      "feedback": ["Positionierung", "2+ Argumente", "Ca. 80 Woerter"]
    },
    {
      "aufgabe": 3,
      "arbeitszeit": "15 Minuten",
      "fieldId": "write3",
      "task": "Aufgabe 3 ù Formelle E-Mail ca. 40 Woerter. Entschuldigung zu ${t}.",
      "minWords": 40,
      "criteria": ["Hoefliche Entschuldigung", "Grund", "Formelle Anrede"],
      "modelAnswer": "...",
      "feedback": ["Formeller Ton", "Entschuldigung", "Ca. 40 Woerter"]
    }
  ],
  "sprechenParts": [
    {
      "teil": 1,
      "title": "Gemeinsam etwas planen",
      "dauer": "ca. 3-4 Minuten",
      "fieldId": "speak1",
      "situation": "Teil 1 ù Situation zu ${t}. Gemeinsam planen.",
      "points": ["Wann / Wo?", "Was mitbringen?", "Wie loesen?", "Was danach?"],
      "minExchanges": 4,
      "modelAnswer": "Ich: ...\\nPartner: ...",
      "feedback": ["Vorschlaege", "Reagieren", "Entscheiden"]
    },
    {
      "teil": 2,
      "title": "Ein Thema praesentieren",
      "dauer": "ca. 3 Minuten",
      "fieldId": "speak2",
      "situation": "Teil 2 ù Praesentation zu ${t} in Ihrem Heimatland.",
      "points": ["Einleitung", "Eigene Erfahrung", "Vor- und Nachteile", "Meinung", "Schluss"],
      "minWords": 80,
      "modelAnswer": "...",
      "feedback": ["5 Teile", "Eigene Meinung", "Ca. 80 Woerter"]
    },
    {
      "teil": 3,
      "title": "Feedback geben",
      "dauer": "ca. 2 Minuten",
      "fieldId": "speak3",
      "situation": "Teil 3 ù Rueckmeldung zur Praesentation. Frage stellen und beantworten.",
      "points": ["Positives Feedback", "Frage stellen", "Frage beantworten"],
      "minExchanges": 3,
      "modelAnswer": "...",
      "feedback": ["Rueckmeldung", "Frage", "Antwort"]
    }
  ]
}`;
  }

  function buildB2(topic) {
    const t = topic || 'Digitalisierung und Gesellschaft';
    return `Du bist Pruefungsautor beim Goethe-Institut und erstellst einen vollstaendigen Modellsatz fuer das Goethe-Zertifikat B2 zum Thema "${t}".

KRITISCH: Antworte NUR mit gueltigem JSON. Kein Markdown, keine Erklaerung. Beginne mit { und ende mit }.
KRITISCH: Authentisches, idiomatisches Deutsch. Keine vereinfachte oder "schulische" Sprache.
KRITISCH: Saemtlicher Pruefungsinhalt muss auf DEUTSCH sein (ausser kurze Hoeren-Kontextsaetze auf Englisch).
KRITISCH: Befolge exakt die Aufgabentypen und Teilstrukturen des offiziellen Goethe-Zertifikats B2 Modellsatzes.

SPRACHNIVEAU B2: Akademischer Wortschatz. Passiv, Konjunktiv I (indirekte Rede), Konjunktiv II, Genitivkonstruktionen, komplexe Nebensatzkonstruktionen. Texte aus Presse, Wissenschaftspopularisierung, gesellschaftlicher Debatte. Nuancierte Argumentation erforderlich. Themenbezug: ${t}.

Erstelle EXAKT diese JSON-Struktur mit echtem Inhalt (keine Platzhalter):

{
  "topic": "${t}",
  "level": "B2",
  "lang": "de",
  "goetheFormat": true,
  "official": {
    "board": "Goethe-Institut",
    "certificate": "Goethe-Zertifikat B2",
    "note": "Modellsatz (KI-generiert). Struktur nach offiziellem Goethe-Zertifikat B2."
  },
  "modules": {
    "lesen": { "title": "Lesen", "time": "80 Minuten" },
    "horen": { "title": "Hoeren", "time": "40 Minuten" },
    "schreiben": { "title": "Schreiben", "time": "80 Minuten" },
    "sprechen": { "title": "Sprechen", "time": "15 Minuten (zwei Teilnehmende)" }
  },
  "lesenParts": [
    {
      "teil": 1,
      "arbeitszeit": "10 Minuten",
      "instruction": "Teil 1 ñ Lesen\\nLesen Sie den Text und die Aufgaben 1 bis 6 dazu.\\nSchreiben Sie: Richtig oder Falsch.",
      "textTitle": "Titel: Essay oder Blog zu ${t}",
      "text": "Essayistischer oder persoenlicher Text (250-350 Woerter, B2) zu ${t}. Komplexe Satzstruktur, nuancierte Argumentation.",
      "questions": [
        {"id": "l1", "type": "rf", "question": "1  ...", "correct": "R"},
        {"id": "l2", "type": "rf", "question": "2  ...", "correct": "F"},
        {"id": "l3", "type": "rf", "question": "3  ...", "correct": "R"},
        {"id": "l4", "type": "rf", "question": "4  ...", "correct": "F"},
        {"id": "l5", "type": "rf", "question": "5  ...", "correct": "R"},
        {"id": "l6", "type": "rf", "question": "6  ...", "correct": "F"}
      ]
    },
    {
      "teil": 2,
      "arbeitszeit": "20 Minuten",
      "instruction": "Teil 2 ñ Lesen\\nLesen Sie den Text aus der Presse und die Aufgaben 7 bis 12 dazu.\\nWaehlen Sie a, b oder c.",
      "textTitle": "Presseartikel / Wissenschaftspopularisierung zu ${t}",
      "text": "Journalistischer oder wissenschaftspopulaerer Text (250-350 Woerter, B2) zu ${t}. Passiv, indirekte Rede, Fachvokabular.",
      "questions": [
        {"id": "l7", "type": "multiple", "question": "7  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"},
        {"id": "l8", "type": "multiple", "question": "8  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"},
        {"id": "l9", "type": "multiple", "question": "9  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "c"},
        {"id": "l10", "type": "multiple", "question": "10  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"},
        {"id": "l11", "type": "multiple", "question": "11  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"},
        {"id": "l12", "type": "multiple", "question": "12  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "c"}
      ]
    },
    {
      "teil": 3,
      "arbeitszeit": "10 Minuten",
      "instruction": "Teil 3 ñ Lesen\\nSituationen 13-17, Anzeigen A-F. Jede Anzeige einmal. Eine passt nicht (0).",
      "ads": [
        {"key": "A", "title": "...", "text": "..."},
        {"key": "B", "title": "...", "text": "..."},
        {"key": "C", "title": "...", "text": "..."},
        {"key": "D", "title": "...", "text": "..."},
        {"key": "E", "title": "...", "text": "..."},
        {"key": "F", "title": "...", "text": "..."}
      ],
      "questions": [
        {"id": "l13", "type": "match", "question": "13  ...", "options": ["A", "B", "C", "D", "E", "0"], "correct": "A"},
        {"id": "l14", "type": "match", "question": "14  ...", "options": ["A", "B", "C", "D", "E", "0"], "correct": "C"},
        {"id": "l15", "type": "match", "question": "15  ...", "options": ["A", "B", "C", "D", "E", "0"], "correct": "B"},
        {"id": "l16", "type": "match", "question": "16  ...", "options": ["A", "B", "C", "D", "E", "0"], "correct": "D"},
        {"id": "l17", "type": "match", "question": "17  ...", "options": ["A", "B", "C", "D", "E", "0"], "correct": "E"}
      ]
    },
    {
      "teil": 4,
      "arbeitszeit": "10 Minuten",
      "instruction": "Teil 4 ñ Lesen\\nMeinungen 18-22. Ja (dafuer) oder Nein (dagegen).",
      "textTitle": "Forum / Leserbriefe zu ${t}",
      "text": "Fuenf differenzierte Meinungen (je 30-50 Woerter, B2) verschiedener Personen zu ${t}. Nuancierte Argumentation.",
      "questions": [
        {"id": "l18", "type": "yn", "question": "18  Name", "correct": "J"},
        {"id": "l19", "type": "yn", "question": "19  Name", "correct": "N"},
        {"id": "l20", "type": "yn", "question": "20  Name", "correct": "J"},
        {"id": "l21", "type": "yn", "question": "21  Name", "correct": "N"},
        {"id": "l22", "type": "yn", "question": "22  Name", "correct": "J"}
      ]
    },
    {
      "teil": 5,
      "arbeitszeit": "10 Minuten",
      "instruction": "Teil 5 ñ Lesen\\nAufgaben 23-27. Waehlen Sie a, b oder c.",
      "textTitle": "Richtlinie / Merkblatt zu ${t}",
      "text": "Offizieller Text (180-220 Woerter, B2) mit Regeln und juristischen Formulierungen zu ${t}.",
      "questions": [
        {"id": "l23", "type": "multiple", "question": "23  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"},
        {"id": "l24", "type": "multiple", "question": "24  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"},
        {"id": "l25", "type": "multiple", "question": "25  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "c"},
        {"id": "l26", "type": "multiple", "question": "26  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"},
        {"id": "l27", "type": "multiple", "question": "27  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"}
      ]
    }
  ],
  "horenParts": [
    {
      "teil": 1,
      "plays": 2,
      "instruction": "Hoeren Teil 1\\nZwei kurze Texte, zweimal. Waehlen Sie die richtige Loesung.",
      "segments": [
        {
          "label": "Text 1: Anrufbeantworter",
          "transcript": "Text (180-220 Woerter, B2) zu ${t}. Schnelleres Sprechtempo impliziert, Fachvokabular.",
          "questions": [
            {"id": "h1", "type": "rf", "question": "1  ...", "correct": "R"},
            {"id": "h2", "type": "multiple", "question": "2  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"}
          ]
        },
        {
          "label": "Text 2: Durchsage",
          "transcript": "Radioansage (180-220 Woerter, B2) zu ${t}.",
          "questions": [
            {"id": "h3", "type": "rf", "question": "3  ...", "correct": "F"},
            {"id": "h4", "type": "multiple", "question": "4  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"}
          ]
        }
      ]
    },
    {
      "teil": 2,
      "plays": 1,
      "instruction": "Hoeren Teil 2\\nLaengerer Text, einmal. Waehlen Sie a, b oder c.",
      "context": "Context in English: lecture / expert presentation about ${t}.",
      "transcript": "Laengerer Text (200-250 Woerter, B2) zu ${t}. Akademischer Wortschatz.",
      "questions": [
        {"id": "h5", "type": "multiple", "question": "5  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "c"},
        {"id": "h6", "type": "multiple", "question": "6  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "b"},
        {"id": "h7", "type": "multiple", "question": "7  ...", "options": ["a) ...", "b) ...", "c) ..."], "correct": "a"}
      ]
    },
    {
      "teil": 3,
      "plays": 1,
      "instruction": "Hoeren Teil 3\\nGespraech, einmal. Richtig oder Falsch.",
      "context": "Context in English: professional conversation about ${t}.",
      "transcript": "Gespraech A: B: (200-250 Woerter, B2) zu ${t}. Differenzierte Argumentation.",
      "questions": [
        {"id": "h8", "type": "rf", "question": "8  ...", "correct": "R"},
        {"id": "h9", "type": "rf", "question": "9  ...", "correct": "F"},
        {"id": "h10", "type": "rf", "question": "10  ...", "correct": "R"},
        {"id": "h11", "type": "rf", "question": "11  ...", "correct": "F"}
      ]
    },
    {
      "teil": 4,
      "plays": 2,
      "instruction": "Hoeren Teil 4\\nDiskussion, zweimal. Wer sagt was? M / F / H.",
      "context": "Context in English: radio panel discussion about ${t}.",
      "speakers": ["Moderator/in", "Gast 1", "Gast 2"],
      "transcript": "Diskussion (220-250 Woerter, B2) zu ${t}. Anspruchsvolle Argumentation.",
      "questions": [
        {"id": "h12", "type": "match", "question": "12  ...", "options": ["M", "F", "H"], "correct": "F"},
        {"id": "h13", "type": "match", "question": "13  ...", "options": ["M", "F", "H"], "correct": "H"},
        {"id": "h14", "type": "match", "question": "14  ...", "options": ["M", "F", "H"], "correct": "F"},
        {"id": "h15", "type": "match", "question": "15  ...", "options": ["M", "F", "H"], "correct": "M"}
      ]
    }
  ],
  "schreibenParts": [
    {
      "aufgabe": 1,
      "arbeitszeit": "25 Minuten",
      "fieldId": "write1",
      "task": "Aufgabe 1 ñ E-Mail oder Brief ca. 150 Woerter zu ${t}. Halbformeller Stil. Drei Inhaltspunkte.",
      "minWords": 150,
      "criteria": ["Inhalt", "Kommunikative Gestaltung", "Formale Richtigkeit"],
      "modelAnswer": "...",
      "feedback": ["Anrede und Schluss", "Alle 3 Punkte", "Ca. 150 Woerter, halbformell"]
    },
    {
      "aufgabe": 2,
      "arbeitszeit": "35 Minuten",
      "fieldId": "write2",
      "task": "Aufgabe 2 ñ Erˆrterung / Kommentar ca. 200 Woerter zu gesellschaftlicher Frage aus ${t}. Pro und Contra, klare Position.",
      "minWords": 200,
      "criteria": ["Strukturierte Erˆrterung", "Mindestens 2 Argumente pro Seite", "Eigene Position mit Begruendung"],
      "modelAnswer": "...",
      "feedback": ["Einleitung, Hauptteil, Schluss", "Differenzierte Argumentation", "Ca. 200 Woerter"]
    },
    {
      "aufgabe": 3,
      "arbeitszeit": "20 Minuten",
      "fieldId": "write3",
      "task": "Aufgabe 3 ñ Formeller Brief oder E-Mail ca. 60 Woerter zu ${t}. Beschwerde, Anfrage oder Kuendigung.",
      "minWords": 60,
      "criteria": ["Formeller Ton", "Klare Anliegen", "Hoefliche Formulierungen"],
      "modelAnswer": "...",
      "feedback": ["Formelle Anrede", "Sachlicher Inhalt", "Ca. 60 Woerter"]
    }
  ],
  "sprechenParts": [
    {
      "teil": 1,
      "title": "Gemeinsam etwas planen",
      "dauer": "ca. 3-4 Minuten",
      "fieldId": "speak1",
      "situation": "Teil 1 ñ Komplexe Planungssituation zu ${t}. Abwaegen von Alternativen, Kompromisse finden.",
      "points": ["Alternativen nennen", "Vor- und Nachteile abwaegen", "Kompromiss finden", "Naechste Schritte festlegen"],
      "minExchanges": 5,
      "modelAnswer": "Ich: ...\\nPartner: ...",
      "feedback": ["Differenzierte Vorschlaege", "Argumentieren", "Gemeinsame Entscheidung"]
    },
    {
      "teil": 2,
      "title": "Ein Thema praesentieren",
      "dauer": "ca. 3-4 Minuten",
      "fieldId": "speak2",
      "situation": "Teil 2 ñ Praesentation zu kontroverser gesellschaftlicher Frage aus ${t}.",
      "points": ["Einleitung mit These", "Fakten und Beispiele", "Gegenargumente einbeziehen", "Eigene Position begruenden", "Schluss"],
      "minWords": 120,
      "modelAnswer": "...",
      "feedback": ["Strukturierte Praesentation", "Nuancierte Argumentation", "Ca. 120 Woerter"]
    },
    {
      "teil": 3,
      "title": "Diskutieren",
      "dauer": "ca. 3 Minuten",
      "fieldId": "speak3",
      "situation": "Teil 3 ñ Kontroverse Diskussion zur Praesentation. Kritische Rueckmeldung, Gegenposition vertreten, Fragen beantworten.",
      "points": ["Kritische Rueckmeldung", "Gegenposition vertreten", "Auf Einwaende reagieren", "Frage stellen und beantworten"],
      "minExchanges": 4,
      "modelAnswer": "...",
      "feedback": ["Differenzierte Rueckmeldung", "Argumente austauschen", "Hoeflich aber bestimmt"]
    }
  ]
}`;
  }

  return { buildA1, buildB1, buildB2 };
})();
