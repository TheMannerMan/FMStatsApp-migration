using FMStatsApp.Models;
using static FMStatsApp.Models.Player;
using Xunit;

namespace FMStatsApp.Core.Tests;

public class PlayerParserTests
{
    // ParseWage tests
    // Note: HtmlParser.cs does NOT call ParseWage — it uses its own inline string
    // replacement on line 30. ParseWage is tested here as a standalone utility.

    [Theory]
    [InlineData("€11,250 p/w", 11250)]
    [InlineData("€1,000 p/w", 1000)]
    [InlineData("€500 p/w", 500)]
    [InlineData("€100,000 p/w", 100000)]
    public void ParseWage_ValidInput_ReturnsCorrectValue(string input, int expected)
    {
        int result = PlayerParser.ParseWage(input);
        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void ParseWage_EmptyOrWhitespace_ReturnsZero(string input)
    {
        int result = PlayerParser.ParseWage(input);
        Assert.Equal(0, result);
    }

    [Fact]
    public void ParseWage_Null_ReturnsZero()
    {
        int result = PlayerParser.ParseWage(null!);
        Assert.Equal(0, result);
    }

    // ParseTransferValue tests

    [Theory]
    [InlineData("€27M - €33M", 27000000)]
    [InlineData("€500K - €1M", 500000)]
    [InlineData("€1.5M - €2M", 1500000)]
    [InlineData("€3M", 3000000)]
    [InlineData("€750K", 750000)]
    public void ParseTransferValue_ValidInput_ReturnsFirstValueInEuros(string input, int expected)
    {
        int result = PlayerParser.ParseTransferValue(input);
        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    [InlineData("Not for sale")]
    [InlineData("N/A")]
    public void ParseTransferValue_NoNumericValue_ReturnsZero(string input)
    {
        int result = PlayerParser.ParseTransferValue(input);
        Assert.Equal(0, result);
    }

    [Fact]
    public void ParseTransferValue_Null_ReturnsZero()
    {
        int result = PlayerParser.ParseTransferValue(null!);
        Assert.Equal(0, result);
    }
}
