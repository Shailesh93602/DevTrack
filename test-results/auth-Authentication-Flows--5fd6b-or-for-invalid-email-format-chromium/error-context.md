# Page snapshot

```yaml
- generic [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e4]:
      - generic [ref=e5]:
        - img [ref=e7]
        - heading "Welcome back" [level=1] [ref=e11]
        - paragraph [ref=e12]: Sign in to continue your progress
      - generic [ref=e13]:
        - generic [ref=e14]:
          - text: Email
          - textbox "Email" [active] [ref=e15]:
            - /placeholder: you@example.com
            - text: invalid-email
        - generic [ref=e17]:
          - text: Password
          - generic [ref=e18]:
            - textbox "••••••••" [ref=e19]
            - button "Show password" [ref=e20]:
              - img
              - generic [ref=e21]: Show password
        - button "Sign in" [ref=e22]
      - paragraph [ref=e24]:
        - text: Don't have an account?
        - link "Sign up" [ref=e25] [cursor=pointer]:
          - /url: /signup
    - paragraph [ref=e26]: By signing in, you agree to our Terms of Service and Privacy Policy
  - button "Open Next.js Dev Tools" [ref=e32] [cursor=pointer]:
    - img [ref=e33]
  - alert [ref=e36]
```