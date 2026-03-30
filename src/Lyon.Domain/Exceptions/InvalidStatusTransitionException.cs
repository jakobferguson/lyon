namespace Lyon.Domain.Exceptions;

public class InvalidStatusTransitionException : DomainException
{
    public string FromStatus { get; }
    public string ToStatus { get; }

    public InvalidStatusTransitionException(string fromStatus, string toStatus)
        : base($"Invalid status transition from '{fromStatus}' to '{toStatus}'.")
    {
        FromStatus = fromStatus;
        ToStatus = toStatus;
    }
}
