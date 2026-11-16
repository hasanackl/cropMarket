using System.Security.Claims;
using CropMarket.Application.Features.Orders;
using CropMarket.Application.Features.Orders.Dtos;
using CropMarket.Application.Features.Orders.Requests;
using CropMarket.Application.Features.Orders.Results;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CropMarket.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrdersController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    // POST /api/orders (FR-04, FR-05, NFR-02; consumers only)
    [Authorize(Roles = "Consumer")]
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(CreateOrderRequest request)
    {
        // The consumer id comes from the token, not from the request body
        var consumerId = int.Parse(User.FindFirstValue("sub")!);
        var result = await _orderService.CreateAsync(consumerId, request);

        if (!result.IsSuccess)
        {
            var statusCode = result.Error switch
            {
                CreateOrderError.ListingNotFound => StatusCodes.Status404NotFound,
                CreateOrderError.StockChanged => StatusCodes.Status409Conflict,
                _ => StatusCodes.Status400BadRequest
            };

            return Problem(title: "The order could not be placed.", detail: result.Message, statusCode: statusCode);
        }

        return StatusCode(StatusCodes.Status201Created, result.Order);
    }
}
