using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CropMarket.API.ErrorHandling;

// Catches every exception that a controller did not handle and turns it into a ProblemDetails
// answer, so the client never sees a stack trace and every error has the same JSON shape.
public class GlobalExceptionHandler : IExceptionHandler
{
    private readonly IProblemDetailsService _problemDetailsService;
    private readonly ILogger<GlobalExceptionHandler> _logger;

    public GlobalExceptionHandler(IProblemDetailsService problemDetailsService, ILogger<GlobalExceptionHandler> logger)
    {
        _problemDetailsService = problemDetailsService;
        _logger = logger;
    }

    public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
    {
        // Two saves on the same row at the same time (RowVersion, ADR-02) that a service did not catch
        var isConflict = exception is DbUpdateConcurrencyException;

        if (isConflict)
        {
            _logger.LogWarning(exception, "Concurrency conflict on {Path}", httpContext.Request.Path);
        }
        else
        {
            _logger.LogError(exception, "Unhandled exception on {Path}", httpContext.Request.Path);
        }

        httpContext.Response.StatusCode = isConflict ? StatusCodes.Status409Conflict : StatusCodes.Status500InternalServerError;

        return await _problemDetailsService.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = httpContext,
            Exception = exception,
            ProblemDetails = new ProblemDetails
            {
                Status = httpContext.Response.StatusCode,
                Title = isConflict ? "The data was changed by someone else." : "Something went wrong on the server.",
                Detail = isConflict
                    ? "Please reload the page and try again."
                    : "The error has been logged. Please try again later."
            }
        });
    }
}