using System;
using System.Collections.Generic;
using System.Text;
using System.Text.RegularExpressions;
using Linia.Domain.Common;

namespace Linia.Domain.ValueObjects
{
    public record DrawingColor
    {
        public string Hex { get; init; }
        public DrawingColor(string hex)
        {
            if (!Regex.IsMatch(hex, @"^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$"))
                throw new DomainException($"Invalid hex color: {hex}");
            Hex = hex.ToUpperInvariant();
        }

        public static DrawingColor Black => new("#000000");
        public static DrawingColor White => new("#FFFFFF");
    }

}
