namespace FMStatsApp.Models
{

	public enum Position
	{
		GK,  // Målvakt
		DL, DC, DR, // Försvarare
		WBL, WBR, // Wingbacks
		DM, // Defensiv mittfältare
		ML, MC, MR, // Centrala och breda mittfältare
		AML, AMC, AMR, // Offensiva mittfältare
		ST // Anfallare
	}

	public class Formation
	{
		public string Name { get; set; }
		public List<Position> Positions { get; set; }

		public Formation(string name, List<Position> positions)
		{
			Name = name;
			Positions = positions;
		}
	}

	// Exempel på formationer
	public static class FormationCatalog
	{
		public static List<Formation> AllFormations { get; } = new List<Formation>
		{
			new Formation("4-4-2", new List<Position> { Position.GK, Position.DL, Position.DC, Position.DC, Position.DR, Position.ML, Position.MC, Position.MC, Position.MR, Position.ST, Position.ST }),
			new Formation("4-2-3-1", new List<Position> { Position.GK, Position.DL, Position.DC, Position.DC, Position.DR, Position.DM, Position.DM, Position.AML, Position.AMC, Position.AMR, Position.ST }),
			new Formation("5-3-2", new List<Position> { Position.GK, Position.WBL, Position.DC, Position.DC, Position.DC, Position.WBR, Position.MC, Position.MC, Position.MC, Position.ST, Position.ST })
		};
	}
}
