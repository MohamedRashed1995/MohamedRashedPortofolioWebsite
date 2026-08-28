using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddContentCaches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AiEvaluationCases",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(240)", maxLength: 240, nullable: false),
                    Category = table.Column<string>(type: "nvarchar(80)", maxLength: 80, nullable: false),
                    FlawedResponse = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    IdentifiedFlaw = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CorrectedEvaluation = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Takeaway = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AiEvaluationCases", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "GithubMetricsCaches",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TotalRepos = table.Column<int>(type: "int", nullable: false),
                    TotalCommitsLast90Days = table.Column<int>(type: "int", nullable: false),
                    TopLanguagesJson = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    LastSyncedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_GithubMetricsCaches", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_GithubMetricsCaches_LastSyncedAt",
                table: "GithubMetricsCaches",
                column: "LastSyncedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AiEvaluationCases");

            migrationBuilder.DropTable(
                name: "GithubMetricsCaches");
        }
    }
}
