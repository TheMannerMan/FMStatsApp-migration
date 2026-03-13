using FMStatsApp.Models;
using FMStatsApp.Services;
using Xunit;

namespace FMStatsApp.Core.Tests;

public class ScoringCalculatorTests
{
    private static Player CreatePlayerWithAllAttributes(int value)
    {
        return new Player
        {
            OneVsOne = value,
            Acceleration = value,
            AerialAbility = value,
            Aggression = value,
            Agility = value,
            Anticipation = value,
            Balance = value,
            Bravery = value,
            CommandOfArea = value,
            Concentration = value,
            Composure = value,
            Crossing = value,
            Decisions = value,
            Determination = value,
            Dribbling = value,
            Finishing = value,
            FirstTouch = value,
            Flair = value,
            Handling = value,
            Heading = value,
            JumpingReach = value,
            Kicking = value,
            Leadership = value,
            LongShots = value,
            Marking = value,
            OffTheBall = value,
            Pace = value,
            Passing = value,
            Positioning = value,
            Reflexes = value,
            Stamina = value,
            Strength = value,
            Tackling = value,
            Teamwork = value,
            Technique = value,
            Throwing = value,
            ThrowOuts = value,
            Vision = value,
            WorkRate = value,
            Corners = value,
        };
    }

    [Fact]
    public void AddRoleScoring_AllAttributesTen_AllRoleScoresEqualTen()
    {
        // Invariant: (10 * weightSum) / weightSum = 10.0 for every role
        var calculator = new ScoringCalculator();
        var player = CreatePlayerWithAllAttributes(10);

        var roles = calculator.AddRoleScoring(player);

        Assert.NotNull(roles);
        foreach (var role in roles)
        {
            Assert.True(
                Math.Abs(role.RoleScore - 10.0f) < 0.001f,
                $"Role '{role.RoleName}' expected score 10.0 but got {role.RoleScore}");
        }
    }

    [Fact]
    public void AddRoleScoring_AllAttributesZero_AllRoleScoresEqualZero()
    {
        var calculator = new ScoringCalculator();
        var player = CreatePlayerWithAllAttributes(0);

        var roles = calculator.AddRoleScoring(player);

        Assert.NotNull(roles);
        foreach (var role in roles)
        {
            Assert.True(
                Math.Abs(role.RoleScore) < 0.001f,
                $"Role '{role.RoleName}' expected score 0.0 but got {role.RoleScore}");
        }
    }

    [Fact]
    public void AddRoleScoring_ReturnsAllRoles()
    {
        var calculator = new ScoringCalculator();
        var player = CreatePlayerWithAllAttributes(10);

        var roles = calculator.AddRoleScoring(player);

        Assert.Equal(RoleCatalog.AllRoles.Count, roles.Count);
    }

    [Fact]
    public void AddRoleScoring_KnownGkdAttributes_ReturnsCorrectScore()
    {
        // Hand-calculated for GKD role:
        // Weights: OneVsOne=1, AerialAbility=3, Agility=5, Anticipation=1,
        //          CommandOfArea=3, Concentration=3, Decisions=1, Handling=3,
        //          Kicking=3, Positioning=3, Reflexes=5, Throwing=1  => weightSum=32
        //
        // Base: all attributes = 10 => baseScore = 320
        // Agility=15 (+5 * 5 = +25), Reflexes=14 (+4 * 5 = +20), Positioning=12 (+2 * 3 = +6)
        // totalScore = 320 + 25 + 20 + 6 = 371
        // expectedScore = 371 / 32 = 11.59375
        var calculator = new ScoringCalculator();
        var player = CreatePlayerWithAllAttributes(10);
        player.Agility = 15;
        player.Reflexes = 14;
        player.Positioning = 12;

        var roles = calculator.AddRoleScoring(player);
        var gkd = roles.Single(r => r.ShortRoleName == "GKD");

        float expectedScore = 371f / 32f;
        Assert.True(
            Math.Abs(gkd.RoleScore - expectedScore) < 0.001f,
            $"GKD expected {expectedScore} but got {gkd.RoleScore}");
    }

    [Fact]
    public void AddRoleScoring_RoleNamesAreNotEmpty()
    {
        var calculator = new ScoringCalculator();
        var player = CreatePlayerWithAllAttributes(10);

        var roles = calculator.AddRoleScoring(player);

        Assert.All(roles, role =>
        {
            Assert.False(string.IsNullOrWhiteSpace(role.RoleName));
            Assert.False(string.IsNullOrWhiteSpace(role.ShortRoleName));
        });
    }
}
