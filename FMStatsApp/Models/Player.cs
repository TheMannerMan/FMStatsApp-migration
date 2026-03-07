using System.Globalization;
using System.Text.RegularExpressions;

namespace FMStatsApp.Models
{
	public class Player
	{

		public List<Role> Roles { get; set; }
		public string Reg { get; set; }
		public string Inf { get; set; }
		public string Name { get; set; }
		public int Age { get; set; }
		public int Wage { get; set; }
		public int TransferValue { get; set; }
		public string Nationality { get; set; }
		public string SecondNationality { get; set; }
		public string Position { get; set; }
		public string Personality { get; set; }
		public string MediaHandling { get; set; }
		public double AverageRating { get; set; }
		public string LeftFoot { get; set; }
		public string RightFoot { get; set; }
		public int Height { get; set; }




		// Attributes
		#region Attributes
		public int OneVsOne { get; set; }
		public int Acceleration { get; set; }
		public int AerialAbility { get; set; }
		public int Aggression { get; set; }
		public int Agility { get; set; }
		public int Anticipation { get; set; }
		public int Balance { get; set; }
		public int Bravery { get; set; }
		public int CommandOfArea { get; set; }
		public int Concentration { get; set; }
		public int Composure { get; set; }
		public int Crossing { get; set; }
		public int Decisions { get; set; }
		public int Determination { get; set; }
		public int Dribbling { get; set; }
		public int Finishing { get; set; }
		public int FirstTouch { get; set; }
		public int Flair { get; set; }
		public int Handling { get; set; }
		public int Heading { get; set; }
		public int JumpingReach { get; set; }
		public int Kicking { get; set; }
		public int Leadership { get; set; }
		public int LongShots { get; set; }
		public int Marking { get; set; }
		public int OffTheBall { get; set; }
		public int Pace { get; set; }
		public int Passing { get; set; }
		public int Positioning { get; set; }
		public int Reflexes { get; set; }
		public int Stamina { get; set; }
		public int Strength { get; set; }
		public int Tackling { get; set; }
		public int Teamwork { get; set; }
		public int Technique { get; set; }
		public int Throwing { get; set; }
		public int ThrowOuts { get; set; }
		public int Vision { get; set; }
		public int WorkRate { get; set; }

		public long UID { get; set; }
		public int Corners { get; set; }
		public string Club { get; set; }
		#endregion

		// Role scoring
		#region
		
		#endregion

		public static class PlayerParser
		{
			public static int ParseWage(string wageString)
			{
				// Example input: "€11,250 p/w"
				if (string.IsNullOrWhiteSpace(wageString)) return 0;

				// Remove "€" and "p/w", and parse the number
				string cleanedWage = Regex.Replace(wageString, @"[^\d]", "");
				return int.TryParse(cleanedWage, NumberStyles.AllowThousands, CultureInfo.InvariantCulture, out int wage) ? wage : 0;
			}

			public static int ParseTransferValue(string transferValueString)
			{
				// Example input: "€27M - €33M"
				if (string.IsNullOrWhiteSpace(transferValueString)) return 0;

				// Extract the first number in millions or thousands
				var match = Regex.Match(transferValueString, @"(\d+(\.\d+)?)\s*[MK]");
				if (!match.Success) return 0;

				// Parse the value and convert to euros
				double value = double.Parse(match.Groups[1].Value, CultureInfo.InvariantCulture);
				if (transferValueString.Contains("M"))
				{
					value *= 1_000_000;
				}
				else if (transferValueString.Contains("K"))
				{
					value *= 1_000;
				}

				return (int)value;
			}
		}
	}
}
