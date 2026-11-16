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

    // ---------- Consumer ----------

    // POST /api/orders (FR-04, FR-05, NFR-02)
    [Authorize(Roles = "Consumer")]
    [HttpPost]
    public async Task<ActionResult<OrderDto>> Create(CreateOrderRequest request)
    {
        var result = await _orderService.CreateAsync(GetUserId(), request);

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

    // GET /api/orders/mine
    [Authorize(Roles = "Consumer")]
    [HttpGet("mine")]
    public async Task<ActionResult<List<MyOrderDto>>> GetMine()
    {
        return Ok(await _orderService.GetMineAsync(GetUserId()));
    }

    // PUT /api/orders/5 (FR-07)
    [Authorize(Roles = "Consumer")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<MyOrderDto>> Update(int id, UpdateOrderRequest request)
    {
        var result = await _orderService.UpdateAsync(GetUserId(), id, request);

        if (!result.IsSuccess)
        {
            var statusCode = result.Error switch
            {
                UpdateOrderError.OrderNotFound => StatusCodes.Status404NotFound,
                UpdateOrderError.InvalidQuantity or UpdateOrderError.InsufficientStock => StatusCodes.Status400BadRequest,
                _ => StatusCodes.Status409Conflict
            };

            return Problem(title: "The order could not be changed.", detail: result.Message, statusCode: statusCode);
        }

        return Ok(result.Order);
    }

    // PATCH /api/orders/5/cancel (FR-08)
    [Authorize(Roles = "Consumer")]
    [HttpPatch("{id:int}/cancel")]
    public async Task<ActionResult<MyOrderDto>> Cancel(int id)
    {
        var result = await _orderService.CancelAsync(GetUserId(), id);

        if (!result.IsSuccess)
        {
            var statusCode = result.Error == CancelOrderError.OrderNotFound
                ? StatusCodes.Status404NotFound
                : StatusCodes.Status409Conflict;

            return Problem(title: "The order could not be cancelled.", detail: result.Message, statusCode: statusCode);
        }

        return Ok(result.Order);
    }

    // ---------- Farmer ----------

    // GET /api/orders/received (FR-06)
    [Authorize(Roles = "Farmer")]
    [HttpGet("received")]
    public async Task<ActionResult<List<ReceivedOrderDto>>> GetReceived()
    {
        return Ok(await _orderService.GetReceivedAsync(GetUserId()));
    }

    // PATCH /api/orders/5/status (FR-06, NFR-03)
    [Authorize(Roles = "Farmer")]
    [HttpPatch("{id:int}/status")]
    public async Task<ActionResult<ReceivedOrderDto>> UpdateStatus(int id, UpdateOrderStatusRequest request)
    {
        var result = await _orderService.UpdateStatusAsync(GetUserId(), id, request);

        if (!result.IsSuccess)
        {
            var statusCode = result.Error switch
            {
                UpdateOrderStatusError.OrderNotFound => StatusCodes.Status404NotFound,
                UpdateOrderStatusError.NotYourOrder => StatusCodes.Status403Forbidden,
                _ => StatusCodes.Status400BadRequest
            };

            return Problem(title: "The order status could not be changed.", detail: result.Message, statusCode: statusCode);
        }

        return Ok(result.Order);
    }

    // GET /api/orders/received/unseen-count (FR-09)
    [Authorize(Roles = "Farmer")]
    [HttpGet("received/unseen-count")]
    public async Task<ActionResult<int>> GetUnseenCount()
    {
        return Ok(await _orderService.GetUnseenCountAsync(GetUserId()));
    }

    // GET /api/orders/received/unseen (FR-09)
    [Authorize(Roles = "Farmer")]
    [HttpGet("received/unseen")]
    public async Task<ActionResult<List<ReceivedOrderDto>>> GetUnseen()
    {
        return Ok(await _orderService.GetUnseenAsync(GetUserId()));
    }

    // POST /api/orders/received/mark-seen (FR-09)
    [Authorize(Roles = "Farmer")]
    [HttpPost("received/mark-seen")]
    public async Task<IActionResult> MarkSeen()
    {
        await _orderService.MarkSeenAsync(GetUserId());
        return NoContent();
    }

    // The user id comes from the token, never from the request body
    private int GetUserId() => int.Parse(User.FindFirstValue("sub")!);
}