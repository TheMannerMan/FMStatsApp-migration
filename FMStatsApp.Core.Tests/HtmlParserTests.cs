using FMStatsApp.Services;
using Xunit;

namespace FMStatsApp.Core.Tests;

// squad-export.html column layout (57 columns, matches HtmlParser.cs):
//   [0] Reg, [1] Inf, [2] Name, [3] Age, [4] Wage, [5] Transfer Value,
//   [6] Nat, [7] 2nd Nat, [8] Position, [9] Personality, [10] Media Handling,
//   [11] Av Rat, [12] Left Foot, [13] Right Foot, [14] Height,
//   [15-53] attributes (1v1 through Wor), [54] UID, [55] Cor, [56] Club

public class HtmlParserTests
{
    private static readonly string FixturePath = Path.Combine("TestData", "squad-export.html");

    [Fact]
    public void ParsedPlayers_ValidFixture_ReturnsNonEmptyList()
    {
        var parser = new HtmlParser(new ScoringCalculator());
        using var stream = File.OpenRead(FixturePath);

        var players = parser.ParsedPlayers(stream);

        Assert.NotNull(players);
        Assert.NotEmpty(players);
    }

    [Fact]
    public void ParsedPlayers_ValidFixture_Returns9Players()
    {
        // The fixture has 10 <tr> rows; the first is the header (skipped), leaving 9 players.
        var parser = new HtmlParser(new ScoringCalculator());
        using var stream = File.OpenRead(FixturePath);

        var players = parser.ParsedPlayers(stream);

        Assert.Equal(9, players.Count);
    }

    [Fact]
    public void ParsedPlayers_ValidFixture_AllPlayersHave85Roles()
    {
        var parser = new HtmlParser(new ScoringCalculator());
        using var stream = File.OpenRead(FixturePath);

        var players = parser.ParsedPlayers(stream);

        Assert.All(players, player =>
        {
            Assert.NotNull(player.Roles);
            Assert.Equal(85, player.Roles.Count);
        });
    }

    [Fact]
    public void ParsedPlayers_ValidFixture_PlayerNamesAreNotEmpty()
    {
        var parser = new HtmlParser(new ScoringCalculator());
        using var stream = File.OpenRead(FixturePath);

        var players = parser.ParsedPlayers(stream);

        Assert.All(players, player =>
            Assert.False(string.IsNullOrWhiteSpace(player.Name)));
    }

    [Fact]
    public void ParsedPlayers_EmptyStream_ReturnsEmptyList()
    {
        var parser = new HtmlParser(new ScoringCalculator());
        using var stream = new MemoryStream();

        var players = parser.ParsedPlayers(stream);

        Assert.NotNull(players);
        Assert.Empty(players);
    }

    [Fact]
    public void ParsedPlayers_HtmlWithNoTableRows_ReturnsEmptyList()
    {
        var parser = new HtmlParser(new ScoringCalculator());
        const string html = "<html><body><table></table></body></html>";
        using var stream = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(html));

        var players = parser.ParsedPlayers(stream);

        Assert.NotNull(players);
        Assert.Empty(players);
    }

    // -------------------------------------------------------------------------
    // Spot checks — first player: Adrian Kurd Rønning
    //   Age=18, Wage=0 (N/A), TV="€700K - €1,5M"→700000, Nat=NOR, Club=FCSM
    //   Height=177, UID=2000178393, Corners=6
    //   Attributes: 1v1=2, Acc=15, Aer=3, Agg=10, Agi=15, Ant=12, Bal=14,
    //     Bra=3, Cmd=1, Cnt=6, Cmp=13, Cro=8, Dec=8, Det=8, Dri=15, Fin=13,
    //     Fir=14, Fla=14, Han=4, Hea=4, Jum=9, Kic=2, Ldr=8, Lon=7, Mar=6,
    //     OtB=11, Pac=14, Pas=11, Pos=3, Ref=2, Sta=9, Str=5, Tck=1, Tea=7,
    //     Tec=14, Thr=3, TRO=2, Vis=9, Wor=12
    // -------------------------------------------------------------------------

    [Fact]
    public void ParsedPlayers_FirstPlayer_HasCorrectMetadata()
    {
        var parser = new HtmlParser(new ScoringCalculator());
        using var stream = File.OpenRead(FixturePath);

        var players = parser.ParsedPlayers(stream);
        var player = players[0];

        Assert.Equal("Adrian Kurd Rønning", player.Name);
        Assert.Equal(18, player.Age);
        Assert.Equal("FCSM", player.Club);
        Assert.Equal("NOR", player.Nationality);
        Assert.Equal(0, player.Wage);               // "N/A" → parse fails → 0
        Assert.Equal(700_000, player.TransferValue); // "€700K - €1,5M" → first value K
        Assert.Equal("Balanced", player.Personality);
        Assert.Equal("Level-headed", player.MediaHandling);
        Assert.Equal("Reasonable", player.LeftFoot);
        Assert.Equal("Very Strong", player.RightFoot);
        Assert.Equal(177, player.Height);
        Assert.Equal(2000178393L, player.UID);
        Assert.Equal(6, player.Corners);
    }

    [Fact]
    public void ParsedPlayers_FirstPlayer_HasCorrectAttributes()
    {
        // Verified against squad-export.html row 2, columns [15]-[53]
        var parser = new HtmlParser(new ScoringCalculator());
        using var stream = File.OpenRead(FixturePath);

        var players = parser.ParsedPlayers(stream);
        var player = players[0];

        Assert.Equal(2, player.OneVsOne);
        Assert.Equal(15, player.Acceleration);
        Assert.Equal(3, player.AerialAbility);
        Assert.Equal(10, player.Aggression);
        Assert.Equal(15, player.Agility);
        Assert.Equal(12, player.Anticipation);
        Assert.Equal(14, player.Balance);
        Assert.Equal(3, player.Bravery);
        Assert.Equal(1, player.CommandOfArea);
        Assert.Equal(6, player.Concentration);
        Assert.Equal(13, player.Composure);
        Assert.Equal(8, player.Crossing);
        Assert.Equal(8, player.Decisions);
        Assert.Equal(8, player.Determination);
        Assert.Equal(15, player.Dribbling);
        Assert.Equal(13, player.Finishing);
        Assert.Equal(14, player.FirstTouch);
        Assert.Equal(14, player.Flair);
        Assert.Equal(4, player.Handling);
        Assert.Equal(4, player.Heading);
        Assert.Equal(9, player.JumpingReach);
        Assert.Equal(2, player.Kicking);
        Assert.Equal(8, player.Leadership);
        Assert.Equal(7, player.LongShots);
        Assert.Equal(6, player.Marking);
        Assert.Equal(11, player.OffTheBall);
        Assert.Equal(14, player.Pace);
        Assert.Equal(11, player.Passing);
        Assert.Equal(3, player.Positioning);
        Assert.Equal(2, player.Reflexes);
        Assert.Equal(9, player.Stamina);
        Assert.Equal(5, player.Strength);
        Assert.Equal(1, player.Tackling);
        Assert.Equal(7, player.Teamwork);
        Assert.Equal(14, player.Technique);
        Assert.Equal(3, player.Throwing);
        Assert.Equal(2, player.ThrowOuts);
        Assert.Equal(9, player.Vision);
        Assert.Equal(12, player.WorkRate);
    }

    [Fact]
    public void ParsedPlayers_FirstPlayer_GkdRoleScoreMatchesHandCalculatedValue()
    {
        // Adrian Kurd Rønning's GKD score — hand-calculated:
        // GKD weights: OneVsOne=1, AerialAbility=3, Agility=5, Anticipation=1,
        //              CommandOfArea=3, Concentration=3, Decisions=1, Handling=3,
        //              Kicking=3, Positioning=3, Reflexes=5, Throwing=1  → weightSum=32
        //
        // 2*1 + 3*3 + 15*5 + 12*1 + 1*3 + 6*3 + 8*1 + 4*3 + 2*3 + 3*3 + 2*5 + 3*1
        // = 2 + 9 + 75 + 12 + 3 + 18 + 8 + 12 + 6 + 9 + 10 + 3 = 167
        // score = 167 / 32 = 5.21875
        var parser = new HtmlParser(new ScoringCalculator());
        using var stream = File.OpenRead(FixturePath);

        var players = parser.ParsedPlayers(stream);
        var player = players[0];
        var gkd = player.Roles.Single(r => r.ShortRoleName == "GKD");

        float expectedScore = 167f / 32f;
        Assert.True(Math.Abs(gkd.RoleScore - expectedScore) < 0.001f,
            $"GKD expected {expectedScore} but got {gkd.RoleScore}");
    }
}
