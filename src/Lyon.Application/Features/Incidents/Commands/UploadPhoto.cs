using Lyon.Application.Common.Authorization;
using Lyon.Application.Common.Interfaces;
using Lyon.Contracts.Responses;
using Lyon.Domain.Entities;
using Lyon.Domain.Enums;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace Lyon.Application.Features.Incidents.Commands;

[Authorize(UserRole.FieldReporter)]
public record UploadPhotoCommand(Guid IncidentId, string FileName, string ContentType, long FileSize, Stream Content) : IRequest<IncidentPhotoResponse>;

public class UploadPhotoCommandHandler : IRequestHandler<UploadPhotoCommand, IncidentPhotoResponse>
{
    private readonly IApplicationDbContext _db;
    private readonly IFileStorageService _storage;
    private readonly ICurrentUserService _currentUser;
    private readonly IDateTimeProvider _dateTime;

    public UploadPhotoCommandHandler(
        IApplicationDbContext db,
        IFileStorageService storage,
        ICurrentUserService currentUser,
        IDateTimeProvider dateTime)
    {
        _db = db;
        _storage = storage;
        _currentUser = currentUser;
        _dateTime = dateTime;
    }

    public async Task<IncidentPhotoResponse> Handle(UploadPhotoCommand command, CancellationToken cancellationToken)
    {
        var incident = await _db.Incidents
            .FirstOrDefaultAsync(i => i.Id == command.IncidentId && !i.IsDeleted, cancellationToken)
            ?? throw new KeyNotFoundException($"Incident {command.IncidentId} not found.");

        var photoCount = await _db.IncidentPhotos.CountAsync(p => p.IncidentId == command.IncidentId, cancellationToken);
        if (photoCount >= 15)
            throw new InvalidOperationException("Maximum of 15 photos per incident.");

        var storagePath = await _storage.UploadAsync(
            "incident-photos",
            $"{command.IncidentId}/{Guid.NewGuid()}{Path.GetExtension(command.FileName)}",
            command.Content,
            command.ContentType,
            cancellationToken);

        var photo = new IncidentPhoto
        {
            Id = Guid.NewGuid(),
            IncidentId = command.IncidentId,
            FileName = command.FileName,
            StoragePath = storagePath,
            ContentType = command.ContentType,
            FileSizeBytes = command.FileSize,
            SortOrder = photoCount,
            UploadedById = _currentUser.UserId,
            CreatedAt = _dateTime.UtcNow,
        };

        _db.IncidentPhotos.Add(photo);
        await _db.SaveChangesAsync(cancellationToken);

        return new IncidentPhotoResponse
        {
            Id = photo.Id,
            FileName = photo.FileName,
            Url = _storage.GetPublicUrl(photo.StoragePath),
            ContentType = photo.ContentType,
            FileSizeBytes = photo.FileSizeBytes,
            SortOrder = photo.SortOrder,
        };
    }
}
