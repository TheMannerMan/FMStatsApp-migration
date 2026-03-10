# Running the App Locally

You need both servers running simultaneously. Open two terminals:

## Terminal 1 — .NET API (port 5000)

```bash
cd FMStatsApp.Api
dotnet run
```

## Terminal 2 — Angular Dev Server (port 4200)

```bash
cd fm-stats-angular
export PATH="$HOME/.nvm/versions/node/v24.14.0/bin:$PATH"
ng serve
```

Then open **http://localhost:4200** in your browser.

## Verification Checklist

1. Browser redirects to `/upload` automatically
2. Select an FM HTML export file and click Upload
3. Should navigate to `/players` and show the table with player rows
4. Click a column header to sort
5. Uncheck a position group in the left sidebar — those columns should disappear instantly

## Troubleshooting

If you see a blank table after upload, open browser DevTools → Network tab and check the `POST /api/players/upload` request — it should return 200 with a JSON array of players.
