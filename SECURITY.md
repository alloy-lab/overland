# Security Configuration

This document outlines the security measures implemented in the Overland Stack application.

## Environment Variables

Create a `.env` file in the root directory with the following variables:

> **Note**: The Docker Compose files have been updated to include all security environment variables. Make sure to set these in your `.env` file for production deployments.

```bash
# Environment
NODE_ENV=development
PORT=3000

# Database
DATABASE_URI=postgresql://username:password@localhost:5432/overland_db

# Payload CMS
PAYLOAD_SECRET=your-super-secret-key-at-least-32-characters-long
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
PAYLOAD_PUBLIC_CMS_URL=http://localhost:3001

# Security
ALLOWED_ORIGIN_1=https://yourdomain.com
ALLOWED_ORIGIN_2=https://www.yourdomain.com
ADMIN_IP_WHITELIST=127.0.0.1,::1
API_KEY=your-api-key-for-external-access
ADMIN_TOKEN=your-admin-token-for-admin-access

# Security Features (true/false)
ENABLE_RATE_LIMITING=true
ENABLE_CORS=true

# Logging
LOG_LEVEL=info

# File Uploads
MAX_FILE_SIZE=10MB
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain
```

## Security Features

### 1. Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Password Reset**: 3 requests per hour per IP

### 2. CORS Protection

- Configurable allowed origins
- Credentials support
- Specific headers and methods allowed

### 3. Security Headers (Helmet)

- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- HSTS (HTTP Strict Transport Security)

### 4. Input Sanitization

- XSS prevention through input sanitization
- HTML tag and attribute filtering
- Event handler removal

### 5. Input Validation

- Express-validator for request validation
- Sanitization of user inputs
- File upload validation

### 6. File Upload Security

- File type validation
- File size limits (10MB default)
- Malicious extension blocking
- MIME type verification

### 7. API Security

- API key authentication
- Admin token authentication
- Request/response logging
- IP whitelisting for admin routes

### 8. Error Handling

- Structured error responses
- No sensitive information leakage
- Comprehensive logging

## Security Best Practices

### Development

1. Use strong, unique secrets for `PAYLOAD_SECRET`
2. Enable all security features in development
3. Use HTTPS in production
4. Regularly update dependencies

### Production

1. Set `NODE_ENV=production`
2. Use strong, randomly generated secrets
3. Configure proper CORS origins
4. Enable IP whitelisting for admin access
5. Use a reverse proxy (nginx/Apache)
6. Enable SSL/TLS certificates
7. Regular security audits

### Docker Deployment

The Docker Compose files have been updated to include all security environment variables:

- **Production** (`docker-compose.yml`): All security features enabled by default
- **Development** (`docker-compose.dev.yml`): More permissive settings for development

Make sure to set the following environment variables in your `.env` file:

- `API_KEY` - For API authentication
- `ADMIN_TOKEN` - For admin access
- `ALLOWED_ORIGIN_1` and `ALLOWED_ORIGIN_2` - For CORS configuration
- `ADMIN_IP_WHITELIST` - For IP-based access control

### Monitoring

1. Monitor rate limit violations
2. Log security events
3. Set up alerts for suspicious activity
4. Regular security updates

## API Security

### Authentication

- API routes require valid API key in `X-API-Key` header
- Admin routes require valid admin token in `X-Admin-Token` header

### Rate Limiting

- Different limits for different endpoint types
- IP-based limiting with configurable windows

### Validation

- All inputs validated and sanitized
- File uploads checked for type and size
- SQL injection prevention through parameterized queries

## File Upload Security

### Allowed Types

- Images: JPEG, PNG, GIF, WebP
- Documents: PDF, TXT
- Maximum size: 10MB

### Validation

- MIME type verification
- File extension checking
- Malicious file detection
- Size limit enforcement

## Logging

### Security Events

- Failed authentication attempts
- Rate limit violations
- File upload attempts
- API access logs
- Error occurrences

### Log Levels

- `error`: Critical security issues
- `warn`: Security warnings
- `info`: General security events
- `http`: HTTP request logs
- `debug`: Detailed debugging info

## Incident Response

### Security Breach

1. Immediately change all secrets
2. Review logs for attack vectors
3. Update security configurations
4. Notify relevant parties
5. Document incident

### Regular Maintenance

1. Update dependencies monthly
2. Review security logs weekly
3. Test security configurations
4. Backup security configurations
5. Document security changes
