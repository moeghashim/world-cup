# v0.4.1 Knockout Penalty Winner

v0.4.1 fixes knockout scoring for matches decided on penalties. Provider result
payloads already expose the advancing side; this milestone stores that side in
the result cache and lets scoring award knockout advancement points from it
before falling back to score comparison.

Tasks:

- `001-add-result-winner-schema`
- `002-wire-provider-winner-cache-scoring`
- `003-add-penalty-winner-tests-and-qa`
