# Contributing to Overland Stack

Thank you for your interest in contributing to Overland Stack! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- pnpm 8 or higher
- Docker and Docker Compose
- Git

### Development Setup

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/overland-stack.git
   cd overland-stack
   ```

2. **Install Dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start Development Environment**

   ```bash
   # Using Docker (recommended)
   docker compose -f docker-compose.dev.yml up -d

   # Or locally
   pnpm dev
   ```

## 📋 Development Guidelines

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **Formatting**: Follow the existing code style
- **Naming**: Use descriptive, camelCase names
- **Comments**: Add JSDoc comments for public APIs

### Project Structure

```
apps/
├── cms/           # Payload CMS application
└── web/           # React Router SSR application

packages/
└── ui/            # Shared UI components

scripts/           # Build and development scripts
```

### Adding Features

#### New Collections (CMS)

1. Create collection file in `apps/cms/src/collections/`
2. Add to `apps/cms/src/payload.config.ts`
3. Update types: `pnpm generate:types --filter=cms`

Example:

```typescript
// apps/cms/src/collections/Products.ts
import type { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    // ... more fields
  ],
};
```

#### New Routes (Web App)

1. Create route file in `apps/web/src/routes/`
2. Add to `apps/web/src/routes/index.ts`
3. Update API client if needed

Example:

```typescript
// apps/web/src/routes/products._index.tsx
export function ProductsIndex() {
  // Component implementation
}
```

#### Shared Components

1. Add component to `packages/ui/src/`
2. Export from `packages/ui/src/index.ts`
3. Use in applications

Example:

```typescript
// packages/ui/src/ProductCard.tsx
export function ProductCard({ product }: { product: Product }) {
  // Component implementation
}
```

### Testing

- **Unit Tests**: Add tests for utility functions
- **Integration Tests**: Test API endpoints
- **E2E Tests**: Test user workflows
- **Type Checking**: Ensure TypeScript compiles without errors

```bash
# Run type checking
pnpm typecheck

# Run tests (when implemented)
pnpm test

# Run linting
pnpm lint
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the issue
2. **Steps to Reproduce**: Detailed steps to reproduce the bug
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: OS, Node.js version, browser, etc.
6. **Screenshots**: If applicable

### Bug Report Template

```markdown
## Bug Description

Brief description of the bug

## Steps to Reproduce

1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior

What you expected to happen

## Actual Behavior

What actually happened

## Environment

- OS: [e.g. macOS, Windows, Linux]
- Node.js: [e.g. 18.17.0]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 1.0.0]

## Additional Context

Any other context about the problem
```

## ✨ Feature Requests

When requesting features, please include:

1. **Use Case**: Why is this feature needed?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: Other solutions you've considered
4. **Additional Context**: Any other relevant information

### Feature Request Template

```markdown
## Feature Description

Brief description of the feature

## Use Case

Why is this feature needed? What problem does it solve?

## Proposed Solution

How should this feature work?

## Alternatives

What other solutions have you considered?

## Additional Context

Any other context, mockups, or examples
```

## 🔄 Pull Request Process

### Before Submitting

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Make** your changes
4. **Test** your changes thoroughly
5. **Commit** with clear messages: `git commit -m 'Add amazing feature'`
6. **Push** to your fork: `git push origin feature/amazing-feature`

### Pull Request Guidelines

1. **Title**: Use a clear, descriptive title
2. **Description**: Explain what changes you made and why
3. **Testing**: Describe how you tested the changes
4. **Breaking Changes**: Note any breaking changes
5. **Documentation**: Update documentation if needed

### Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] I have tested these changes locally
- [ ] I have added tests for new functionality
- [ ] All existing tests pass

## Checklist

- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
```

### Review Process

1. **Automated Checks**: CI/CD pipeline runs tests and checks
2. **Code Review**: Maintainers review the code
3. **Feedback**: Address any feedback or requested changes
4. **Approval**: Once approved, the PR will be merged

## 📚 Documentation

### Updating Documentation

- **README**: Update for new features or setup changes
- **API Docs**: Document new API endpoints
- **Code Comments**: Add JSDoc comments for public APIs
- **Examples**: Provide usage examples for new features

### Documentation Standards

- Use clear, concise language
- Include code examples
- Keep documentation up to date
- Use proper markdown formatting

## 🏷️ Release Process

### Versioning

We follow [Semantic Versioning](https://semver.org/):

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Release Checklist

- [ ] Update version numbers
- [ ] Update CHANGELOG.md
- [ ] Update documentation
- [ ] Run full test suite
- [ ] Create release notes
- [ ] Tag the release

## 🤝 Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Welcome newcomers and help them learn
- Focus on constructive feedback
- Respect different opinions and approaches

### Communication

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions and ideas
- **Pull Requests**: Use PR comments for code review discussions

## 🛠️ Development Tools

### Recommended VS Code Extensions

- TypeScript and JavaScript Language Features
- ESLint
- Prettier
- Docker
- GitLens

### Useful Commands

```bash
# Install dependencies
pnpm install

# Start development
pnpm dev

# Build for production
pnpm build

# Type check
pnpm typecheck

# Clean build artifacts
pnpm clean

# Update dependencies
pnpm update
```

## 📞 Getting Help

- **Documentation**: Check the README and inline comments
- **Issues**: Search existing issues or create a new one
- **Discussions**: Use GitHub discussions for questions
- **Community**: Join our community discussions

## 🙏 Recognition

Contributors will be recognized in:

- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to Overland Stack! 🎉
