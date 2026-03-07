using FMStatsApp.Models;

namespace FMStatsApp.Models
{

	public enum GeneralPosition
	{
		Goalkeeper,
		Defender,
		Midfielder,
		Forward
	}

	public record RoleDefinition(string Name, string ShortName, GeneralPosition GeneralPosition, List<Position> Positions, Dictionary<string, int> AttributeWeights);

	public static class RoleCatalog
	{
		public static List<RoleDefinition> AllRoles { get; } = new List<RoleDefinition>
		{
			// GOALKEEPER ROLES
			new RoleDefinition(
				Name: "Goalkeeper (Defend)",
				ShortName: "GKD",
				GeneralPosition: GeneralPosition.Goalkeeper,
				Positions: new List<Position> { Position.GK },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "OneVsOne", 1 },
					{ "AerialAbility", 3 },
					{ "Agility", 5 },
					{ "Anticipation", 1 },
					{ "CommandOfArea", 3 },
					{ "Concentration", 3 },
					{ "Decisions", 1 },
					{ "Handling", 3 },
					{ "JumpingReach", 0 },
					{ "Kicking", 3 },
					{ "Passing", 3 },
					{ "Positioning", 5 },
					{ "Reflexes", 5 },
								{ "Throwing", 1 }
				}),

			new RoleDefinition(
				Name: "Sweeper Keeper (Defend)",
				ShortName: "SKD",
				GeneralPosition: GeneralPosition.Goalkeeper,
				Positions: new List<Position> { Position.GK },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "OneVsOne", 3 },
					{ "Acceleration", 1 },
					{ "AerialAbility", 1 },
					{ "Agility", 5 },
					{ "Anticipation", 3 },
					{ "CommandOfArea", 3 },
					{ "Concentration", 3 },
					{ "Decisions", 1 },
					{ "FirstTouch", 1 },
					{ "Handling", 1 },
					{ "Kicking", 3 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Reflexes", 5 },
					{ "ThrowOuts", 1 },
					{ "Vision", 1 }
				}),

			new RoleDefinition(
				Name: "Sweeper Keeper (Support)",
				ShortName: "SKS",
				GeneralPosition: GeneralPosition.Goalkeeper,
				Positions: new List<Position> { Position.GK },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "OneVsOne", 3 },
					{ "Acceleration", 1 },
					{ "AerialAbility", 1 },
					{ "Agility", 5 },
					{ "Anticipation", 3 },
					{ "CommandOfArea", 3 },
					{ "Concentration", 3 },
					{ "Decisions", 1 },
					{ "FirstTouch", 1 },
					{ "Handling", 1 },
					{ "Kicking", 3 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Reflexes", 5 },
					{ "ThrowOuts", 1 },
					{ "Vision", 1 }
				}),

			new RoleDefinition(
				Name: "Sweeper Keeper (Attack)",
				ShortName: "SKA",
				GeneralPosition: GeneralPosition.Goalkeeper,
				Positions: new List<Position> { Position.GK },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "OneVsOne", 3 },
					{ "Acceleration", 1 },
					{ "AerialAbility", 1 },
					{ "Agility", 5 },
					{ "Anticipation", 3 },
					{ "CommandOfArea", 3 },
					{ "Concentration", 3 },
					{ "Decisions", 1 },
					{ "FirstTouch", 1 },
					{ "Handling", 1 },
					{ "Kicking", 3 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Reflexes", 5 },
					{ "ThrowOuts", 1 },
					{ "Vision", 1 }
				}),

			// CENTRAL DEFENDER ROLES
			new RoleDefinition(
				Name: "Central Defender Defend",
				ShortName: "CDD",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 1 },
					{ "Bravery", 1 },
					{ "Concentration", 1 },
					{ "Composure", 5 },
					{ "Decisions", 1 },
					{ "Heading", 3 },
					{ "JumpingReach", 5 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Positioning", 3 },
					{ "Strength", 3 },
					{ "Tackling", 3 }
				}),

			new RoleDefinition(
				Name: "Central Defender Cover",
				ShortName: "CDC",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 3 },
					{ "Bravery", 1 },
					{ "Concentration", 3 },
					{ "Composure", 5 },
					{ "Decisions", 3 },
					{ "Heading", 1 },
					{ "JumpingReach", 5 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Positioning", 3 },
					{ "Strength", 1 },
					{ "Tackling", 3 }
				}),

			new RoleDefinition(
				Name: "Central Defender Stopper",
				ShortName: "CDS",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 3 },
					{ "Anticipation", 1 },
					{ "Bravery", 3 },
					{ "Concentration", 1 },
					{ "Composure", 5 },
					{ "Decisions", 3 },
					{ "Heading", 3 },
					{ "JumpingReach", 5 },
					{ "Marking", 1 },
					{ "Pace", 5 },
					{ "Positioning", 3 },
					{ "Strength", 3 },
					{ "Tackling", 3 }
				}),

			new RoleDefinition(
				Name: "Ball-Playing Defender (Defend)",
				ShortName: "BPDD",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 3 },
					{ "AerialAbility", 3 },
					{ "Anticipation", 3 },
					{ "Bravery", 1 },
					{ "Concentration", 3 },
					{ "Composure", 5 },
					{ "Decisions", 3 },
					{ "FirstTouch", 3 },
					{ "Heading", 3 },
					{ "JumpingReach", 3 },
					{ "Marking", 3 },
					{ "Pace", 3 },
					{ "Passing", 5 },
					{ "Positioning", 3 },
					{ "Strength", 1 },
					{ "Tackling", 3 },
					{ "Technique", 3 },
					{ "Vision", 3 }
				}),

			new RoleDefinition(
				Name: "Ball Playing Defender Cover",
				ShortName: "BPDC",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 3 },
					{ "Bravery", 1 },
					{ "Concentration", 3 },
					{ "Composure", 5 },
					{ "Decisions", 3 },
					{ "FirstTouch", 1 },
					{ "Heading", 1 },
					{ "JumpingReach", 5 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Strength", 1 },
					{ "Tackling", 3 },
					{ "Technique", 1 },
					{ "Vision", 1 }
				}),

			new RoleDefinition(
				Name: "Ball Playing Defender Stopper",
				ShortName: "BPDS",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 3 },
					{ "Anticipation", 1 },
					{ "Bravery", 3 },
					{ "Concentration", 1 },
					{ "Composure", 5 },
					{ "Decisions", 3 },
					{ "FirstTouch", 1 },
					{ "Heading", 3 },
					{ "JumpingReach", 5 },
					{ "Marking", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 3 },
					{ "Strength", 3 },
					{ "Tackling", 3 },
					{ "Technique", 1 },
					{ "Vision", 1 }
				}),

			new RoleDefinition(
				Name: "Nonsense Centre-Back Cover",
				ShortName: "NCBC",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 3 },
					{ "Bravery", 1 },
					{ "Concentration", 3 },
					{ "Composure", 5 },
					{ "Heading", 1 },
					{ "JumpingReach", 5 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Positioning", 3 },
					{ "Strength", 1 },
					{ "Tackling", 3 }
				}),

			new RoleDefinition(
				Name: "Nonsense Centre-Back Defend",
				ShortName: "NCBD",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 1 },
					{ "Bravery", 1 },
					{ "Concentration", 1 },
					{ "Composure", 5 },
					{ "Heading", 3 },
					{ "JumpingReach", 5 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Positioning", 3 },
					{ "Strength", 3 },
					{ "Tackling", 3 }
				}),

			new RoleDefinition(
				Name: "Nonsense Centre-Back Stopper",
				ShortName: "NCBS",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 3 },
					{ "Anticipation", 1 },
					{ "Bravery", 3 },
					{ "Concentration", 1 },
					{ "Composure", 5 },
					{ "Heading", 3 },
					{ "JumpingReach", 5 },
					{ "Marking", 1 },
					{ "Pace", 5 },
					{ "Positioning", 3 },
					{ "Strength", 3 },
					{ "Tackling", 3 }
				}),

			new RoleDefinition(
				Name: "Libero Defend",
				ShortName: "LD",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Bravery", 1 },
					{ "Concentration", 1 },
					{ "Composure", 5 },
					{ "Decisions", 3 },
					{ "FirstTouch", 3 },
					{ "Heading", 3 },
					{ "JumpingReach", 5 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 3 },
					{ "Stamina", 1 },
					{ "Strength", 3 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 3 }
				}),

			new RoleDefinition(
				Name: "Libero Support",
				ShortName: "LS",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Bravery", 1 },
					{ "Concentration", 1 },
					{ "Composure", 5 },
					{ "Decisions", 3 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 3 },
					{ "Heading", 3 },
					{ "JumpingReach", 5 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 3 },
					{ "Stamina", 1 },
					{ "Strength", 3 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 1 }
				}),

			new RoleDefinition(
				Name: "Wide Centre-Back Defend",
				ShortName: "WCBD",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Bravery", 1 },
					{ "Concentration", 1 },
					{ "Composure", 5 },
					{ "Decisions", 1 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 1 },
					{ "Heading", 3 },
					{ "JumpingReach", 5 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Strength", 3 },
					{ "Tackling", 3 },
					{ "Technique", 1 },
					{ "WorkRate", 1 }
				}),

			new RoleDefinition(
				Name: "Wide Centre-Back Support",
				ShortName: "WCBS",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Bravery", 1 },
					{ "Concentration", 1 },
					{ "Composure", 5 },
					{ "Crossing", 1 },
					{ "Decisions", 1 },
					{ "Dribbling", 3 },
					{ "FirstTouch", 1 },
					{ "Heading", 3 },
					{ "JumpingReach", 5 },
					{ "Marking", 3 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Stamina", 1 },
					{ "Strength", 3 },
					{ "Tackling", 3 },
					{ "Technique", 1 },
					{ "WorkRate", 1 }
				}),

			new RoleDefinition(
				Name: "Wide Centre-Back Attack",
				ShortName: "WCBA",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Bravery", 1 },
					{ "Concentration", 1 },
					{ "Composure", 5 },
					{ "Crossing", 3 },
					{ "Decisions", 1 },
					{ "Dribbling", 3 },
					{ "FirstTouch", 1 },
					{ "Heading", 3 },
					{ "JumpingReach", 5 },
					{ "Marking", 3 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 1 },
					{ "Stamina", 3 },
					{ "Strength", 3 },
					{ "Tackling", 3 },
					{ "Technique", 1 },
					{ "WorkRate", 1 }
				}),

			// FULL-BACK ROLES
			new RoleDefinition(
				Name: "Full Back Defend",
				ShortName: "FBD",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DL, Position.DR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 3 },
					{ "Concentration", 3 },
					{ "Crossing", 1 },
					{ "Decisions", 1 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Full Back Support",
				ShortName: "FBS",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DL, Position.DR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 3 },
					{ "Concentration", 3 },
					{ "Crossing", 1 },
					{ "Decisions", 1 },
					{ "Dribbling", 1 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Full-Back Attack",
				ShortName: "FBA",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DL, Position.DR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Concentration", 1 },
					{ "Crossing", 3 },
					{ "Decisions", 1 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 1 },
					{ "Marking", 3 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Inverted Full-Back Defend",
				ShortName: "IFBD",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DL, Position.DR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Bravery", 1 },
					{ "Concentration", 1 },
					{ "Composure", 1 },
					{ "Decisions", 1 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 1 },
					{ "Heading", 3 },
					{ "JumpingReach", 1 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Strength", 3 },
					{ "Tackling", 3 },
					{ "Technique", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Nonsense Full-Back Defend",
				ShortName: "NFBD",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DL, Position.DR},
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 3 },
					{ "Bravery", 1 },
					{ "Concentration", 1 },
					{ "Heading", 1 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Strength", 3 },
					{ "Tackling", 3 },
					{ "Teamwork", 1 },
					{ "WorkRate", 5 }
				}),

			// WING-BACK ROLES
			new RoleDefinition(
				Name: "Wing-Back Defend",
				ShortName: "WBD",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.WBL, Position.WBR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Balance", 1 },
					{ "Concentration", 1 },
					{ "Crossing", 1 },
					{ "Decisions", 1 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 1 },
					{ "Marking", 3 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Wing-Back Support",
				ShortName: "WBS",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DL, Position.DR, Position.WBL, Position.WBR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Concentration", 1 },
					{ "Crossing", 3 },
					{ "Decisions", 1 },
					{ "Dribbling", 3 },
					{ "FirstTouch", 1 },
					{ "Marking", 3 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Wing-Back Attack",
				ShortName: "WBA",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DL, Position.DR, Position.WBL, Position.WBR  },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Concentration", 1 },
					{ "Crossing", 3 },
					{ "Decisions", 1 },
					{ "Dribbling", 3 },
					{ "FirstTouch", 1 },
					{ "Flair", 1 },
					{ "Marking", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Complete Wing-Back Support",
				ShortName: "CWBS",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.WBL, Position.WBR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Crossing", 3 },
					{ "Decisions", 1 },
					{ "Dribbling", 3 },
					{ "FirstTouch", 1 },
					{ "Flair", 1 },
					{ "Marking", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Tackling", 1 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Complete Wing-Back Attack",
				ShortName: "CWBA",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.WBL, Position.WBR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Crossing", 3 },
					{ "Decisions", 1 },
					{ "Dribbling", 3 },
					{ "FirstTouch", 1 },
					{ "Flair", 3 },
					{ "Marking", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Tackling", 1 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Inverted Wing-Back Defend",
				ShortName: "IWBD",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DL, Position.DR, Position.WBL, Position.WBR  },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Concentration", 1 },
					{ "Composure", 1 },
					{ "Decisions", 3 },
					{ "FirstTouch", 1 },
					{ "Marking", 1 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Inverted Wing-Back Support",
				ShortName: "IWBS",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.DL, Position.DR, Position.WBL, Position.WBR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Concentration", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "FirstTouch", 3 },
					{ "Marking", 1 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Inverted Wing-Back Attack",
				ShortName: "IWBA",
				GeneralPosition: GeneralPosition.Defender,
				Positions: new List<Position> { Position.WBL, Position.WBR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Concentration", 1 },
					{ "Composure", 3 },
					{ "Crossing", 1 },
					{ "Decisions", 3 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 3 },
					{ "Flair", 1 },
					{ "LongShots", 1 },
					{ "Marking", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 }
				}),

			// DEFENSIVE MIDFIELDER ROLES
			new RoleDefinition(
				Name: "Defensive Midfielder Defend",
				ShortName: "DMD",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 3 },
					{ "Concentration", 3 },
					{ "Composure", 1 },
					{ "Decisions", 1 },
					{ "Marking", 1 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Defensive Midfielder Support",
				ShortName: "DMS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 3 },
					{ "Concentration", 3 },
					{ "Composure", 1 },
					{ "Decisions", 1 },
					{ "FirstTouch", 1 },
					{ "Marking", 1 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Strength", 1 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Deep Lying Playmaker Defend",
				ShortName: "DLPD",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM, Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "FirstTouch", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Tackling", 1 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Deep Lying Playmaker Support",
				ShortName: "DLPS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM, Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "FirstTouch", 3 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Ball Winning Midfielder Defend",
				ShortName: "BWMD",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM, Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 3 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Bravery", 1 },
					{ "Concentration", 1 },
					{ "Marking", 1 },
					{ "Pace", 5 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Strength", 1 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Ball Winning Midfielder Support",
				ShortName: "BWMS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM, Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 3 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Bravery", 1 },
					{ "Concentration", 1 },
					{ "Marking", 1 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Stamina", 5 },
					{ "Strength", 1 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Anchor Defend",
				ShortName: "AD",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 3 },
					{ "Concentration", 3 },
					{ "Composure", 1 },
					{ "Decisions", 3 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Strength", 1 },
					{ "Tackling", 3 },
					{ "Teamwork", 1},
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Half Back Defend",
				ShortName: "HBD",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 3 },
					{ "Bravery", 1 },
					{ "Concentration", 3 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "FirstTouch", 1 },
					{ "JumpingReach", 1 },
					{ "Marking", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Strength", 1 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Regista Support",
				ShortName: "REGS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 3 },
					{ "Flair", 3 },
					{ "LongShots", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Roaming Playmaker Support",
				ShortName: "RPS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM, Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Balance", 1 },
					{ "Concentration", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 3 },
					{ "LongShots", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Segundo Volante Support",
				ShortName: "SVS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Concentration", 1 },
					{ "Composure", 1 },
					{ "Decisions", 1 },
					{ "Finishing", 1 },
					{ "FirstTouch", 1 },
					{ "LongShots", 1 },
					{ "Marking", 3 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Strength", 1 },
					{ "Tackling", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Segundo Volante Attack",
				ShortName: "SVA",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.DM },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 3 },
					{ "Balance", 1 },
					{ "Concentration", 1 },
					{ "Composure", 1 },
					{ "Decisions", 1 },
					{ "Finishing", 3 },
					{ "FirstTouch", 1 },
					{ "LongShots", 3 },
					{ "Marking", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "WorkRate", 5 }
				}),

			// CENTRAL MIDFIELDER ROLES

			new RoleDefinition(
				Name: "Central Midfielder Defend",
				ShortName: "CMD",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 1 },
					{ "Concentration", 3 },
					{ "Composure", 1 },
					{ "Decisions", 3 },
					{ "FirstTouch", 1 },
					{ "Marking", 1 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Central Midfielder Support",
				ShortName: "CMS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Concentration", 1 },
					{ "Composure", 1 },
					{ "Decisions", 3 },
					{ "FirstTouch", 3 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Central Midfielder Attack",
				ShortName: "CMA",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Composure", 1 },
					{ "Decisions", 3 },
					{ "FirstTouch", 3 },
					{ "LongShots", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 1 },
					{ "Teamwork", 1 },
					{ "Technique", 1 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Box To Box Midfielder Support",
				ShortName: "B2BS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 1 },
					{ "Decisions", 1 },
					{ "Dribbling", 1 },
					{ "Finishing", 1 },
					{ "FirstTouch", 1 },
					{ "LongShots", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Strength", 1 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "WorkRate", 5 }
				}),
			// ATTACKING MIDFIELDER ROLES
			new RoleDefinition(
				Name: "Advanced Playmaker Support",
				ShortName: "APS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.MC, Position.AMC, Position.AMR, Position.AML },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 3 },
					{ "Flair", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Advanced Playmaker Attack",
				ShortName: "APA",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.MC, Position.AMC, Position.AMR, Position.AML },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 3 },
					{ "Flair", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Mezzala Support",
				ShortName: "MEZS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 1 },
					{ "Decisions", 3 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 1 },
					{ "LongShots", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 1 },
					{ "Technique", 3 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Mezzala Attack",
				ShortName: "MEZA",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 1 },
					{ "Decisions", 3 },
					{ "Dribbling", 3 },
					{ "Finishing", 1 },
					{ "FirstTouch", 1 },
					{ "Flair", 1 },
					{ "LongShots", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Carrilero Support",
				ShortName: "CARS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.MC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Concentration", 1 },
					{ "Composure", 1 },
					{ "Decisions", 3 },
					{ "FirstTouch", 3 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			// WINGER ROLES

			new RoleDefinition(
				Name: "Wide Midfielder Defend",
				ShortName: "WMD",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.ML, Position.MR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Concentration", 3 },
					{ "Composure", 1 },
					{ "Crossing", 1 },
					{ "Decisions", 3 },
					{ "FirstTouch", 1 },
					{ "Marking", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Wide Midfielder Support",
				ShortName: "WMS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.ML, Position.MR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Concentration", 1 },
					{ "Composure", 1 },
					{ "Crossing", 1 },
					{ "Decisions", 3 },
					{ "FirstTouch", 1 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Tackling", 3 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Wide Midfielder Attack",
				ShortName: "WMA",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.ML, Position.MR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Composure", 1 },
					{ "Crossing", 3 },
					{ "Decisions", 3 },
					{ "FirstTouch", 3 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 1 },
					{ "Teamwork", 3 },
					{ "Technique", 1 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Winger Support",
				ShortName: "WS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.ML, Position.MR, Position.AMR, Position.AML},
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 3 },
					{ "Balance", 1 },
					{ "Crossing", 3 },
					{ "Dribbling", 3 },
					{ "FirstTouch", 1 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Stamina", 5 },
					{ "Technique", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Winger Attack",
				ShortName: "WA",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.ML, Position.MR, Position.AML, Position.AMR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 3 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Crossing", 3 },
					{ "Dribbling", 3 },
					{ "FirstTouch", 1 },
					{ "Flair", 1 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Stamina", 5 },
					{ "Technique", 3 },
					{ "WorkRate", 5 }
				}),


			new RoleDefinition(
				Name: "Inverted Winger Support",
				ShortName: "IWS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.ML, Position.MR, Position.AML, Position.AMR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 3 },
					{ "Balance", 1 },
					{ "Composure", 1 },
					{ "Crossing", 3 },
					{ "Decisions", 1 },
					{ "Dribbling", 3 },
					{ "FirstTouch", 1 },
					{ "LongShots", 1 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Technique", 3 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Inverted Winger Attack",
				ShortName: "IWA",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.ML, Position.MR, Position.AML, Position.AMR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 3 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 1 },
					{ "Crossing", 3 },
					{ "Decisions", 1 },
					{ "Dribbling", 3 },
					{ "FirstTouch", 1 },
					{ "Flair", 1 },
					{ "LongShots", 1 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Technique", 3 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Defensive Winger Defend",
				ShortName: "DWD",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.ML, Position.MR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 3 },
					{ "Concentration", 1 },
					{ "Crossing", 1 },
					{ "Decisions", 1 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 1 },
					{ "Marking", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Positioning", 3 },
					{ "Stamina", 5 },
					{ "Tackling", 1 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Defensive Winger Support",
				ShortName: "DWS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.ML, Position.MR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 1 },
					{ "Composure", 1 },
					{ "Concentration", 1 },
					{ "Crossing", 3 },
					{ "Decisions", 1 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 1 },
					{ "Marking", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Positioning", 1 },
					{ "Stamina", 5 },
					{ "Tackling", 1 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "WorkRate", 5 }
				}),
			new RoleDefinition(
				Name: "Wide Playmaker Support",
				ShortName: "WPS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.ML, Position.MR},
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 3 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Wide Playmaker Attack",
				ShortName: "WPA",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.ML, Position.MR, Position.AML, Position.AMR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Dribbling", 3 },
					{ "FirstTouch", 3 },
					{ "Flair", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Inside Forward Support",
				ShortName: "IFS",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.AML, Position.AMR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 3 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 1 },
					{ "Dribbling", 3 },
					{ "Finishing", 3 },
					{ "FirstTouch", 3 },
					{ "Flair", 1 },
					{ "LongShots", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Stamina", 5 },
					{ "Technique", 3 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Inside Forward Attack",
				ShortName: "IFA",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.AML, Position.AMR },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 3 },
					{ "Anticipation", 3 },
					{ "Balance", 1 },
					{ "Composure", 1 },
					{ "Dribbling", 3 },
					{ "Finishing", 3 },
					{ "FirstTouch", 3 },
					{ "Flair", 1 },
					{ "LongShots", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Stamina", 5 },
					{ "Technique", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Trequartista Attack",
				ShortName: "TREQ",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.AMC, Position.AML, Position.AMR, Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Dribbling", 3 },
					{ "Finishing", 5 }, // Varför 5?
					{ "FirstTouch", 3 },
					{ "Flair", 3 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 }, // Not included in the source code. Probably a bug.
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 } //Not included in the source code. Probably a bug.
				}),
			new RoleDefinition(
				Name: "Wide Target Forward Attack",
				ShortName: "WTFA",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.AML, Position.AMR},
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Bravery", 3 },
					{ "Crossing", 1 },
					{ "Finishing", 1 },
					{ "FirstTouch", 1 },
					{ "Heading", 3 },
					{ "JumpingReach", 3 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Stamina", 5 },
					{ "Strength", 3 },
					{ "Teamwork", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Wide Target Forward Support",
				ShortName: "WTFS",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.AML, Position.AMR},
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Bravery", 3 },
					{ "Crossing", 1 },
					{ "FirstTouch", 1 },
					{ "Heading", 3 },
					{ "JumpingReach", 3 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Stamina", 5 },
					{ "Strength", 3 },
					{ "Teamwork", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Raumdeuter Attack",
				ShortName: "RAUA",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.AMR, Position.AML},
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 3 },
					{ "Balance", 3 },
					{ "Composure", 3 },
					{ "Concentration", 3 },
					{ "Decisions", 3 },
					{ "Finishing", 3 },
					{ "FirstTouch", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Stamina", 5 },
					{ "Technique", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Attacking Midfielder Support",
				ShortName: "AMS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.AMC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Composure", 1 },
					{ "Decisions", 3 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 3 },
					{ "Flair", 3 },
					{ "LongShots", 3 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Technique", 3 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Attacking Midfielder Attack",
				ShortName: "AMA",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.AMC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Composure", 1 },
					{ "Decisions", 3 },
					{ "Dribbling", 3 },
					{ "Finishing", 1 },
					{ "FirstTouch", 3 },
					{ "Flair", 3 },
					{ "LongShots", 3 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Technique", 3 },
					{ "Vision", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Enganche Support",
				ShortName: "ENGS",
				GeneralPosition: GeneralPosition.Midfielder,
				Positions: new List<Position> { Position.AMC },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Dribbling", 1 },
					{ "FirstTouch", 3 },
					{ "Flair", 1 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 5 },
					{ "Teamwork", 1 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Shadow Striker Attack",
				ShortName: "SSA",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.AMC},
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Balance", 1 },
					{ "Composure", 3 },
					{ "Concentration", 1 },
					{ "Decisions", 1 },
					{ "Dribbling", 3 },
					{ "Finishing", 3 },
					{ "FirstTouch", 3 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Stamina", 5 },
					{ "Technique", 1 },
					{ "WorkRate", 5 }
				}),

			new RoleDefinition(
				Name: "Deep Lying Forward Support",
				ShortName: "DLFS",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Finishing", 5 }, // varför 5?
					{ "FirstTouch", 3 },
					{ "Flair", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Strength", 1 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 1 }
					// Varför workrate och stamina inte med här?
				}),
			new RoleDefinition(
				Name: "Deep Lying Forward Attack",
				ShortName: "DLFA",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Dribbling", 1 },
					{ "Finishing", 5 }, // varför 5?
					{ "FirstTouch", 3 },
					{ "Flair", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Strength", 1 },
					{ "Teamwork", 3 },
					{ "Technique", 3 },
					{ "Vision", 1 }
					// Varför workrate och stamina inte med här?
				}),

			new RoleDefinition(
				Name: "Advanced Forward Attack",
				ShortName: "AFA",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 1 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 3 },
					{ "Decisions", 1 },
					{ "Dribbling", 3 },
					{ "Finishing", 5 }, // varför 5?
					{ "FirstTouch", 3 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Stamina", 1 },
					{ "Technique", 3 },
					{ "WorkRate", 1 }
				}), // varför workrate och stamina 1?

			new RoleDefinition(
				Name: "Target Forward Support",
				ShortName: "TFS",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 1 },
					{ "Balance", 3 },
					{ "Bravery", 3 },
					{ "Composure", 1 },
					{ "Decisions", 1 },
					{ "Finishing", 5 },
					{ "FirstTouch", 1 },
					{ "Heading", 3 },
					{ "JumpingReach", 3 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Strength", 3 },
					{ "Teamwork", 3 }
					// Varför workrate och stamina inte med här?
				}),

			new RoleDefinition(
				Name: "Target Forward Attack",
				ShortName: "TFA",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 1 },
					{ "Anticipation", 1 },
					{ "Balance", 3 },
					{ "Bravery", 3 },
					{ "Composure", 3 },
					{ "Decisions", 1 },
					{ "Finishing", 5 },
					{ "FirstTouch", 1 },
					{ "Heading", 3 },
					{ "JumpingReach", 3 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Strength", 3 },
					{ "Teamwork", 1 }
					// Varför workrate och stamina inte med här?
				}),

			new RoleDefinition(
				Name: "Poacher Attack",
				ShortName: "PA",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Anticipation", 3 },
					{ "Composure", 3 },
					{ "Decisions", 1 },
					{ "Finishing", 5 }, // varför 5?
					{ "FirstTouch", 1 },
					{ "Heading", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Technique", 1}
				}), // varför ingen workrate och stamina?

			new RoleDefinition(
				Name: "Complete Forward Support",
				ShortName: "CFS",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 3 },
					{ "Anticipation", 3 },
					{ "Balance", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Dribbling", 3 },
					{ "Finishing", 5 }, // varför 5?
					{ "FirstTouch", 3 },
					{ "Heading", 3 },
					{ "JumpingReach", 1 },
					{ "LongShots", 3 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Stamina", 1 },
					{ "Strength", 3 },
					{ "Teamwork", 1 },
					{ "Technique", 3 },
					{ "Vision", 3 },
					{ "WorkRate", 1 }
				}),

			new RoleDefinition(
				Name: "Complete Forward Attack",
				ShortName: "CFA",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 3 },
					{ "Anticipation", 3 },
					{ "Balance", 1 },
					{ "Composure", 3 },
					{ "Decisions", 1 },
					{ "Dribbling", 3 },
					{ "Finishing", 5 }, // varför 5?
					{ "FirstTouch", 3 },
					{ "Heading", 3 },
					{ "JumpingReach", 1 },
					{ "LongShots", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Stamina", 1 },
					{ "Strength", 3 },
					{ "Teamwork", 1 },
					{ "Technique", 3 },
					{ "Vision", 1 },
					{ "WorkRate", 1 }
				}), // Varför workrate och stamina 1?

			new RoleDefinition(
				Name: "Pressing Forward Defend",
				ShortName: "PFD",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 3 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Balance", 1 },
					{ "Bravery", 3 },
					{ "Composure", 1 },
					{ "Concentration", 1 },
					{ "Decisions", 3 },
					{ "Finishing", 5 }, // varför 5?
					{ "FirstTouch", 1 },
					{ "Pace", 5 },
					{ "Stamina", 3 },
					{ "Strength", 1 },
					{ "Teamwork", 3 },
					{ "WorkRate", 3 }
				}),
			// Varför stamina och workrate inte 5?

			new RoleDefinition(
				Name: "Pressing Forward Support",
				ShortName: "PFS",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 3 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Balance", 1 },
					{ "Bravery", 3 },
					{ "Composure", 1 },
					{ "Concentration", 1 },
					{ "Decisions", 3 },
					{ "Finishing", 5 }, // varför 5?
					{ "FirstTouch", 1 },
					{ "OffTheBall", 1 },
					{ "Pace", 5 },
					{ "Passing", 1 },
					{ "Stamina", 3 },
					{ "Strength", 1 },
					{ "Teamwork", 3 },
					{ "WorkRate", 3 }
				}),// Varför stamina och workrate inte 5?

			new RoleDefinition(
				Name: "Pressing Forward Attack",
				ShortName: "PFA",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Aggression", 3 },
					{ "Agility", 1 },
					{ "Anticipation", 3 },
					{ "Balance", 1 },
					{ "Bravery", 3 },
					{ "Composure", 1 },
					{ "Concentration", 1 },
					{ "Decisions", 1 },
					{ "Finishing", 5 }, // varför 5?
					{ "FirstTouch", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Stamina", 3 },
					{ "Strength", 1 },
					{ "Teamwork", 3 },
					{ "WorkRate", 3 }
				}),// Varför stamina och workrate inte 5?

			new RoleDefinition(
				Name: "False nine",
				ShortName: "F9",
				GeneralPosition: GeneralPosition.Forward,
				Positions: new List<Position> { Position.ST },
				AttributeWeights: new Dictionary<string, int>
				{
					{ "Acceleration", 5 },
					{ "Agility", 3 },
					{ "Anticipation", 1 },
					{ "Balance", 1 },
					{ "Composure", 3 },
					{ "Decisions", 3 },
					{ "Dribbling", 3 },
					{ "Finishing", 5 }, // varför 5?
					{ "FirstTouch", 3 },
					{ "Flair", 1 },
					{ "OffTheBall", 3 },
					{ "Pace", 5 },
					{ "Passing", 3 },
					{ "Teamwork", 1 },
					{ "Technique", 3 },
					{ "Vision", 3 }
				}),// Varför stamina och workrate inte 5?
		};
	}
}
