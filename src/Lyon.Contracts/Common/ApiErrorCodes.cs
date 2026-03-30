namespace Lyon.Contracts.Common;

public static class ApiErrorCodes
{
    public const string ValidationFailed = "VALIDATION_FAILED";
    public const string NotFound = "NOT_FOUND";
    public const string Unauthorized = "UNAUTHORIZED";
    public const string Forbidden = "FORBIDDEN";
    public const string Conflict = "CONFLICT";
    public const string InvalidStatusTransition = "INVALID_STATUS_TRANSITION";
    public const string InternalError = "INTERNAL_ERROR";
}
