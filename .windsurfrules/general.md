# General Development Rules

## Core Principles

- **Code Quality**: Write clean, readable, and maintainable code
- **Security First**: Always consider security implications in every decision
- **Performance Aware**: Optimize for performance without sacrificing readability
- **Documentation**: Include clear comments and documentation
- **Testing**: Write tests for critical functionality
- **Error Handling**: Implement comprehensive error handling

## Code Standards

### TypeScript/JavaScript
- Use TypeScript by default for better type safety
- Follow consistent naming conventions (camelCase for variables/functions, PascalCase for classes)
- Use meaningful variable and function names
- Prefer `const` over `let`, avoid `var`
- Use async/await over Promises.then() for better readability
- Include proper JSDoc comments for public APIs

### File Organization
- Keep files focused and single-purpose
- Use clear, descriptive file names
- Organize imports: external libraries first, then internal modules
- Export only what's necessary

### Error Handling
- Use try-catch blocks for async operations
- Return meaningful error messages
- Log errors appropriately (but don't expose sensitive information)
- Implement graceful degradation where possible

## Best Practices

### Security
- Validate all inputs
- Sanitize user data
- Use environment variables for secrets
- Implement proper authentication and authorization
- Follow OWASP security guidelines

### Performance
- Minimize bundle size
- Use lazy loading where appropriate
- Implement caching strategies
- Optimize database queries
- Monitor and measure performance

### Maintainability
- Write self-documenting code
- Use consistent formatting
- Implement proper logging
- Create reusable components/functions
- Follow DRY (Don't Repeat Yourself) principle

## Development Workflow

1. **Plan**: Understand requirements thoroughly before coding
2. **Design**: Plan the architecture and data flow
3. **Implement**: Write code following these standards
4. **Test**: Verify functionality works as expected
5. **Review**: Check code quality and security
6. **Deploy**: Use proper deployment practices
7. **Monitor**: Track performance and errors in production

## Communication

- Ask clarifying questions when requirements are unclear
- Explain complex decisions in comments
- Provide clear commit messages
- Document breaking changes
- Share knowledge with team members
