namespace Lyon.Domain.Constants;

public static class OshaRules
{
    public const int HoursMultiplier = 200_000;

    public static readonly string[] FirstAidTreatments =
    [
        "Non-prescription medications at nonprescription strength",
        "Wound cleaning, bandaging, butterfly strips/Steri-Strips",
        "Hot/cold therapy",
        "Elastic bandages, wraps",
        "Eye patches, eye flushing",
        "Tetanus immunizations",
        "Drinking fluids for heat-related illness"
    ];
}
