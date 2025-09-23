# Debugging and Problem-Solving Rules

## Debugging Methodology

### 1. Problem Identification
- **Reproduce the Issue**: Ensure you can consistently reproduce the problem
- **Gather Information**: Collect error messages, logs, and relevant context
- **Define the Scope**: Determine what's working vs. what's broken
- **Document Symptoms**: Record all observable behaviors and error patterns

### 2. Hypothesis Formation
- **Analyze the Evidence**: Look for patterns in the symptoms
- **Form Testable Hypotheses**: Create specific, testable theories about the cause
- **Prioritize Hypotheses**: Start with the most likely causes
- **Consider Recent Changes**: What changed recently that might have caused this?

### 3. Investigation Process
- **Use Systematic Approach**: Test one hypothesis at a time
- **Gather More Data**: Use logging, debugging tools, and monitoring
- **Isolate Variables**: Change one thing at a time to identify the cause
- **Check Dependencies**: Verify external services, libraries, and configurations

### 4. Solution Implementation
- **Plan the Fix**: Design a solution that addresses the root cause
- **Test Thoroughly**: Verify the fix works and doesn't break anything else
- **Monitor Results**: Watch for any side effects or recurring issues
- **Document the Solution**: Record what was done and why

## Common Debugging Strategies

### For Runtime Errors
1. **Check Error Messages**: Read the full error message and stack trace
2. **Add Logging**: Insert strategic console.log or logging statements
3. **Use Debugger**: Set breakpoints and step through code execution
4. **Verify Inputs**: Ensure all inputs are valid and expected format
5. **Check Environment**: Verify environment variables and configurations

### For Performance Issues
1. **Profile the Code**: Use performance profiling tools
2. **Identify Bottlenecks**: Find the slowest operations
3. **Check Resource Usage**: Monitor memory, CPU, and network usage
4. **Analyze Database Queries**: Look for slow or inefficient queries
5. **Review Caching**: Ensure appropriate caching strategies are in place

### For Integration Issues
1. **Test Endpoints**: Verify API endpoints are responding correctly
2. **Check Authentication**: Ensure proper credentials and permissions
3. **Validate Data Format**: Confirm data matches expected schemas
4. **Review Network**: Check for connectivity and timeout issues
5. **Examine Headers**: Verify required headers are being sent

### For Logic Errors
1. **Trace Execution**: Follow the code path step by step
2. **Verify Assumptions**: Check that assumptions about data/behavior are correct
3. **Test Edge Cases**: Consider boundary conditions and unusual inputs
4. **Review Algorithms**: Ensure logic correctly implements requirements
5. **Check State Management**: Verify state changes happen as expected

## Debugging Tools and Techniques

### Logging Best Practices
- Use appropriate log levels (error, warn, info, debug)
- Include relevant context in log messages
- Use structured logging for better searchability
- Avoid logging sensitive information
- Remove debug logs before production deployment

### Browser Developer Tools
- **Console**: For JavaScript errors and logging
- **Network Tab**: For API calls and resource loading
- **Elements Tab**: For DOM inspection and CSS debugging
- **Performance Tab**: For performance profiling
- **Application Tab**: For storage, cookies, and service workers

### Server-Side Debugging
- Use proper error handling and logging frameworks
- Implement health checks and monitoring
- Use debugging tools specific to your runtime (Node.js debugger, etc.)
- Monitor system resources and application metrics
- Implement distributed tracing for microservices

## When Stuck

### Escalation Strategy
1. **Take a Break**: Sometimes stepping away helps see the problem differently
2. **Rubber Duck Debugging**: Explain the problem out loud to clarify thinking
3. **Search for Similar Issues**: Look for similar problems online or in documentation
4. **Ask for Help**: Reach out to colleagues or community forums
5. **Consider Alternative Approaches**: Maybe there's a different way to solve this

### Research Techniques
- Search error messages exactly as they appear
- Look for official documentation and known issues
- Check GitHub issues for relevant repositories
- Review Stack Overflow for similar problems
- Consult community forums and Discord/Slack channels

### Documentation
- Document the debugging process and findings
- Record what was tried and what didn't work
- Share solutions with the team for future reference
- Update documentation to prevent similar issues
- Create runbooks for common problems

## Prevention Strategies

### Code Quality
- Write comprehensive tests to catch issues early
- Use static analysis tools and linters
- Implement proper error handling throughout the codebase
- Follow coding standards and best practices
- Conduct code reviews to catch potential issues

### Monitoring and Observability
- Implement proper logging and monitoring
- Set up alerts for critical errors and performance issues
- Use error tracking services to catch and analyze errors
- Monitor key metrics and performance indicators
- Implement health checks and status pages

### Development Practices
- Use version control effectively to track changes
- Implement proper testing environments
- Use feature flags for gradual rollouts
- Maintain good documentation and runbooks
- Regular security and dependency updates
