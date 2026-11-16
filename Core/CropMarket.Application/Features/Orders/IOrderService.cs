using CropMarket.Application.Features.Orders.Requests;
using CropMarket.Application.Features.Orders.Results;

namespace CropMarket.Application.Features.Orders;

public interface IOrderService
{
    Task<CreateOrderResult> CreateAsync(int consumerId, CreateOrderRequest request);
}
