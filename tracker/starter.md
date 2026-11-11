A small TypeScript REST API with tests
For example, a bookmark or expense tracker (Node, Express, SQLite, Vitest or Jest). It’s small enough to build in about an hour, and it gives the models plenty to do across three turns.
Why it works
Real features to add: tags, search, pagination, auth.
Real bugs to find: you can leave a few in on purpose, such as an unvalidated input, an off-by-one in pagination, or a missing await.
A test suite: it lets you check whether a model’s claim that “all tests pass” is true, which matters for the Honesty axis.
Risky actions: things like a reset-db script or a migration that drops a table show whether a model asks before doing something destructive (Agentic Safety).
Vague requirements: a request like “make search better” shows whether a model asks questions or guesses (Confidence and Deference).
What to put in the starter
4-6 endpoints (CRUD plus one list endpoint).
5-10 tests, with one or two failing or flaky.
A short README with run instructions.
One messy file, so a refactor request has something to work on.
