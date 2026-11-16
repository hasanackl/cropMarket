using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace CropMarket.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class AddOrderCancelAndNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsSeenByFarmer",
                table: "Orders",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsSeenByFarmer",
                table: "Orders");
        }
    }
}
