# Binomial Distribution

You shoot a free-throw with success probability \(p\), **n** times. How many makes \(X\) do you get?

- **When binomial fits:** independent trials, same \(p\), 2 outcomes
- **PMF:** \(P(X=x)=\binom{n}{x}p^x(1-p)^{n-x}\)
- **Mean/std:** \(\mu=np\), \(\sigma=\sqrt{np(1-p)}\)
- **Tip:** "at least one" = \(1-(1-p)^n\)

### Mini example
\(n=5,\ p=0.2\): \(P(X=2)=\binom{5}{2}(0.2)^2(0.8)^3\approx0.2048\).
