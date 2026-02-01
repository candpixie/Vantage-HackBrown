# 🔒 Security Best Practices

## ⚠️ IMPORTANT: Protecting API Keys and Secrets

This repository is **PUBLIC**. Never commit actual API keys, passwords, or secrets.

## 🛡️ Current Security Status

✅ **GOOD:**
- Source code uses environment variables
- `.env` files are in `.gitignore`
- No hardcoded secrets in code

⚠️ **NEEDS ATTENTION:**
- Always rotate keys if accidentally exposed
- Use deployment platform secret managers
- Enable GitHub secret scanning

## 🔐 How to Handle Secrets

### 1. Local Development

Create a `.env` file in the `backend/` directory (this file is gitignored):

```bash
# backend/.env
PORT=8020
VISA_API_USER_ID=your_actual_visa_key_here
VISA_API_PASSWORD=your_actual_visa_secret_here
```

Load it in your code (already implemented):
```python
import os
VISA_API_USER_ID = os.getenv("VISA_API_USER_ID", "")
```

### 2. Production Deployment

**Railway:**
- Settings → Variables → Add Variable
- Add secrets directly in dashboard
- They're encrypted and never exposed

**Vercel:**
- Settings → Environment Variables
- Add for Production, Preview, Development
- Encrypted at rest

**Render:**
- Environment → Secret Files
- Can upload entire `.env` file
- Encrypted and secure

### 3. Git History

If you accidentally committed secrets:

```bash
# Install BFG Repo-Cleaner
brew install bfg

# Remove secrets from history
bfg --replace-text secrets.txt your-repo.git

# Force push (⚠️ coordinate with team first)
git push --force --all
```

Or use GitHub's guide: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository

### 4. GitHub Secret Scanning

Enable in your repository:
1. Settings → Code security and analysis
2. Enable "Secret scanning"
3. Enable "Push protection"

This prevents accidental commits of secrets.

## 🚨 If a Secret is Exposed

1. **Revoke immediately** at the service (Visa Developer Portal)
2. **Generate new credentials**
3. **Update deployment platforms** with new secrets
4. **Rotate all related secrets** (principle of least privilege)
5. **Consider using** secret management tools (HashiCorp Vault, AWS Secrets Manager)

## ✅ Safe Practices

### In Documentation

❌ **Bad:**
```
VISA_API_USER_ID=J9WUBUTW576AMYGV91S521OcJBRrAGjXr0R7BPmTDVTq2DGGc
```

✅ **Good:**
```
VISA_API_USER_ID=your_visa_api_key_here
VISA_API_PASSWORD=your_visa_shared_secret_here
```

### In Code

❌ **Bad:**
```python
api_key = "J9WUBUTW576AMYGV91S521OcJBRrAGjXr0R7BPmTDVTq2DGGc"
```

✅ **Good:**
```python
api_key = os.getenv("VISA_API_USER_ID")
if not api_key:
    raise ValueError("VISA_API_USER_ID environment variable not set")
```

### In Git

❌ **Bad:**
```bash
git add .env
git commit -m "Add environment variables"
```

✅ **Good:**
```bash
# .env is in .gitignore ✓
git status  # Verify .env is not tracked
git add backend/example.env  # Only commit examples
```

## 📋 Checklist Before Going Public

- [ ] All `.env` files are in `.gitignore`
- [ ] No hardcoded API keys in source code
- [ ] Documentation uses placeholders, not real keys
- [ ] GitHub secret scanning is enabled
- [ ] Team knows how to handle secrets
- [ ] Deployment platforms use secret managers
- [ ] Regular security audits scheduled

## 🔗 Resources

- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Visa Developer Security](https://developer.visa.com/pages/visa-security-program)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

## 💡 Pro Tips

1. **Use different keys** for development, staging, and production
2. **Rotate secrets** regularly (every 90 days minimum)
3. **Monitor** API usage for unusual patterns
4. **Implement** rate limiting on your backend
5. **Use** secret scanning tools in CI/CD pipelines
6. **Document** who has access to which secrets
7. **Audit** access logs periodically

## 🆘 Need Help?

If you suspect a security issue:
1. Do NOT create a public issue
2. Email: security@your-domain.com (if you have one)
3. Or use GitHub's private vulnerability reporting
4. Revoke compromised credentials immediately

---

**Remember:** Security is everyone's responsibility! 🔐
