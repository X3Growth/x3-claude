# Answering visitor and traffic questions

Use this file when the user asks how many people come, why traffic changed, which source brings
interested visitors, or who comes back. Read the guides `concepts/visitors` and
`insights/visitor-quality` first; they define every number below.

## Which tool for which question

| Question | Tool |
|---|---|
| „Wie viele Besucher pro Tag, und wie verändert es sich?“ | `traffic_summary`, then `analytics_overview` (section `visitors`) |
| „Warum sind es mehr oder weniger geworden?“ | `analytics_changes` (`metric` sessions, engaged_plus, hot_plus or leads) |
| „Woher kommen sie?“ | `analytics_breakdown` with `dimension: "channel_group"`, `analytics_timeseries` with `split: "channel_group"` |
| „Wie interessiert sind sie, auch je Quelle?“ | `traffic_quality` (with the arguments compare_by and up to 4 values to compare sources) |
| „Wer kommt wieder?“ | `traffic_returning` |
| „Wann kommen sie?“ / „Ist heute normal?“ | `traffic_heatmap` / `analytics_baseline` |
| „Kommen wir auf unser Leadziel?“ | `leads_projection` (set a goal only with `lead_goal_set` and a number the user named) |
| „Was finden die Leute bei Google?“ | `search_console_report`, `search_console_opportunities` |

Call `traffic_data_quality` when a comparison looks odd: a period before the measuring start is
„Vergleich unsicher“, and import sessions are excluded unless the filter sets include_imported.

## Rules for every answer

- **Never invent numbers.** Rephrase the sentences of the change engine (sentence_de, lines_de) only
  with the numbers in the result, and rank changes by absolute numbers, never by percent.
- **Counting words:** „Besuche“ for visits; „Besucher“ only for „Ø Besucher pro Tag“ and
  „Besuchertage“. Changes are Besuche („478 Besuche mehr über Werbung“). Interest is per visit („73
  Besuche waren ernsthaft interessiert“). Google clicks are Klicks, not people.
- **Hidden cells stay hidden:** `value: null` with `suppressed: true` is „< 3“, `rounded: true` is
  „etwa“. Never compute a hidden value from totals, sums or shares.
- **Tiers:** Nicht interessiert (key `cold`, never „Kalt“) · Neugierig · Interessiert · Heiß;
  „ernsthaft interessiert“ = 30+ by default. No tier is called „Lead“; leads come from the Leads list,
  never from the score.
- **Return visits only with their basis:** same day for everyone (30-minute rule), across days only
  „nur mit Einwilligung“ or for known people, chains „mindestens“. Never an overall return rate, never
  an extrapolation to all visitors, never „neue Besucher“, „Unique“ or „Nutzer“.
- **Ohne Werbung is not worthless:** cost cells of free sources read „keine Werbekosten“, never
  „kostenlos“. „Organisch“ is never used for the whole free traffic: name the channel group (Suche,
  KI Assistenten, Soziale Netzwerke, Verweise, Direkt, E-Mail).
- Comparisons between sources need at least 30 visits per source and period; otherwise say that
  there are too few visits for a comparison.
