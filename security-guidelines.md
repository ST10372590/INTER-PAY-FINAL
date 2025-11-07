# Security Coding Guidelines for Payment Processing

## 1. Input Validation
- Validate ALL user inputs on server-side
- Use parameterized queries for database operations
- Sanitize data before rendering

## 2. Authentication & Authorization
- Implement MFA for sensitive operations
- Use JWT with short expiration times
- Implement rate limiting

## 3. Data Protection
- Encrypt sensitive data at rest (AES-256)
- Use TLS 1.2+ for data in transit
- Never log sensitive payment information

## 4. PCI-DSS Compliance
- Tokenize credit card data
- Maintain audit logs for 1+ year
- Implement network segmentation

## 5. Error Handling
- Never expose stack traces to users
- Log errors securely
- Use generic error messages