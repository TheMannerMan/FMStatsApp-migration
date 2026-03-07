using FMStatsApp.Models;
using static FMStatsApp.Models.Player;

namespace FMStatsApp.Services
{
	public class HtmlParser
	{

		public List<Player> ParsedPlayers(Stream htmlFileStream)
		{
			var htmlDoc = new HtmlAgilityPack.HtmlDocument();
			htmlDoc.Load(htmlFileStream);
			var players = new List<Player>();
			var scoringCalculator = new ScoringCalculator();

			var rows = htmlDoc.DocumentNode.SelectNodes("//table/tr[position()>1]");
			if (rows == null) return players;

			foreach (var row in rows)
			{
				var columns = row.SelectNodes("td");
				if (columns == null || columns.Count < 54) continue;

				var player = new Player
				{
					Reg = columns[0].InnerText.Trim(),
					Inf = columns[1].InnerText.Trim(),
					Name = columns[2].InnerText.Trim(),
					Age = int.TryParse(columns[3].InnerText.Trim(), out var age) ? age : 0,
					Wage = int.TryParse(columns[4].InnerText.Trim().Replace("€", "").Replace(" p/w", "").Trim(), out var wage) ? wage : 0, // Parsing Wage to int
					TransferValue = PlayerParser.ParseTransferValue(columns[5].InnerText.Trim()), // Assuming you have the ParseTransferValue method defined
					Nationality = columns[6].InnerText.Trim(),
					SecondNationality = columns[7].InnerText.Trim(),
					Position = columns[8].InnerText.Trim(),
					Personality = columns[9].InnerText.Trim(),
					MediaHandling = columns[10].InnerText.Trim(),
					AverageRating = double.TryParse(columns[11].InnerText.Trim(), out var rating) ? rating : 0,
					LeftFoot = columns[12].InnerText.Trim(),
					RightFoot = columns[13].InnerText.Trim(),
					Height = int.TryParse(columns[14].InnerText.Trim().Replace(" cm", ""), out var height) ? height : 0,
					OneVsOne = int.TryParse(columns[15].InnerText.Trim(), out var oneVsOne) ? oneVsOne : 0,
					Acceleration = int.TryParse(columns[16].InnerText.Trim(), out var acceleration) ? acceleration : 0,
					AerialAbility = int.TryParse(columns[17].InnerText.Trim(), out var aer) ? aer : 0,
					Aggression = int.TryParse(columns[18].InnerText.Trim(), out var agg) ? agg : 0,
					Agility = int.TryParse(columns[19].InnerText.Trim(), out var agi) ? agi : 0,
					Anticipation = int.TryParse(columns[20].InnerText.Trim(), out var ant) ? ant : 0,
					Balance = int.TryParse(columns[21].InnerText.Trim(), out var bal) ? bal : 0,
					Bravery = int.TryParse(columns[22].InnerText.Trim(), out var bra) ? bra : 0,
					CommandOfArea = int.TryParse(columns[23].InnerText.Trim(), out var cmd) ? cmd : 0,
					Concentration = int.TryParse(columns[24].InnerText.Trim(), out var cnd) ? cnd : 0,
					Composure = int.TryParse(columns[25].InnerText.Trim(), out var cmp) ? cmp : 0,
					Crossing = int.TryParse(columns[26].InnerText.Trim(), out var crd) ? crd : 0,
					Decisions = int.TryParse(columns[27].InnerText.Trim(), out var dec) ? dec : 0,
					Determination = int.TryParse(columns[28].InnerText.Trim(), out var det) ? det : 0,
					Dribbling = int.TryParse(columns[29].InnerText.Trim(), out var dri) ? dri : 0,
					Finishing = int.TryParse(columns[30].InnerText.Trim(), out var fin) ? fin : 0,
					FirstTouch = int.TryParse(columns[31].InnerText.Trim(), out var fir) ? fir : 0,
					Flair = int.TryParse(columns[32].InnerText.Trim(), out var flr) ? flr : 0,
					Handling = int.TryParse(columns[33].InnerText.Trim(), out var han) ? han : 0,
					Heading = int.TryParse(columns[34].InnerText.Trim(), out var hea) ? hea : 0,
					JumpingReach = int.TryParse(columns[35].InnerText.Trim(), out var jum) ? jum : 0,
					Kicking = int.TryParse(columns[36].InnerText, out var kic) ? kic : 0,
					Leadership = int.TryParse(columns[37].InnerText.Trim(), out var ldr) ? ldr : 0,
					LongShots = int.TryParse(columns[38].InnerText.Trim(), out var lon) ? lon : 0,
					Marking = int.TryParse(columns[39].InnerText.Trim(), out var mar) ? mar : 0,
					OffTheBall = int.TryParse(columns[40].InnerText.Trim(), out var OtB) ? OtB : 0,
					Pace = int.TryParse(columns[41].InnerText.Trim(), out var pac) ? pac : 0,
					Passing = int.TryParse(columns[42].InnerText.Trim(), out var pas) ? pas : 0,
					Positioning = int.TryParse(columns[43].InnerText.Trim(), out var pos) ? pos : 0,
					Reflexes = int.TryParse(columns[44].InnerText.Trim(), out var refl) ? refl : 0,
					Stamina = int.TryParse(columns[45].InnerText.Trim(), out var sta) ? sta : 0,
					Strength = int.TryParse(columns[46].InnerText.Trim(), out var str) ? str : 0,
					Tackling = int.TryParse(columns[47].InnerText.Trim(), out var tck) ? tck : 0,
					Teamwork = int.TryParse(columns[48].InnerText.Trim(), out var tea) ? tea : 0,
					Technique = int.TryParse(columns[49].InnerText.Trim(), out var tec) ? tec : 0,
					Throwing = int.TryParse(columns[50].InnerText.Trim(), out var thr) ? thr : 0,
					ThrowOuts = int.TryParse(columns[51].InnerText.Trim(), out var tro) ? tro : 0,
					Vision = int.TryParse(columns[52].InnerText, out var vis) ? vis : 0,
					WorkRate = int.TryParse(columns[53].InnerText.Trim(), out var wor) ? wor : 0,
					UID = long.TryParse(columns[54].InnerText.Trim(), out var uid) ? uid : 0,
					Corners = int.TryParse(columns[55].InnerText.Trim(), out var cor) ? cor : 0,
					Club = columns[56].InnerText.Trim(),
				};
				player.Roles = scoringCalculator.AddRoleScoring(player);
				players.Add(player);
			}
			return players;

		}
	}
}
