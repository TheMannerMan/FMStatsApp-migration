using System.Text.Json;

namespace FMStatsApp.Extensions
{
	public static class SessionExtensions
	{
		public static void SetObjectAsJson(this ISession session, string key, object value)
		{
			var serialiasedObject = JsonSerializer.Serialize(value);
			session.SetString(key, serialiasedObject);
		}

		public static T GetObjectFromJson<T>(this ISession session, string key)
		{
			var value = session.GetString(key);
			var options = new JsonSerializerOptions
			{
				IncludeFields = true
			};
			return value == null ? default(T) : JsonSerializer.Deserialize<T>(value, options);
		}
	}
}
