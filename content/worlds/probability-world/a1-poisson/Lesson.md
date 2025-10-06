# Poisson (counts per interval)

Random counts over time/space at constant rate \(\lambda\); disjoint intervals independent.

- **PMF:** \(P(X=x)=e^{-\lambda}\lambda^x/x!\)
- **Mean = variance = \(\lambda\)**
- **Binomial approx:** if \(n\ge 20\) and \(p\le 0.05\), \(\text{Bin}(n,p)\approx\text{Poisson}(\lambda=np)\)

Rescale \(\lambda\) to new intervals (e.g., per hour → per 15 min).
