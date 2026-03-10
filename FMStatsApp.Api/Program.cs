using FMStatsApp.Api.Repositories;
using FMStatsApp.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Domain services
builder.Services.AddScoped<ScoringCalculator>();
builder.Services.AddScoped<HtmlParser>();

// Repository — swap InMemoryPlayerRepository for a DB implementation here in a future step
builder.Services.AddScoped<IPlayerRepository, InMemoryPlayerRepository>();

// CORS: allow Angular dev server
builder.Services.AddCors(options =>
{
    options.AddPolicy("AngularDev", policy =>
    {
        policy.WithOrigins("http://localhost:4200")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AngularDev"); // Must be before MapControllers
app.MapControllers();

app.Run();
