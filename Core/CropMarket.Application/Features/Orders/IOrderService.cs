using CropMarket.Application.Features.Orders.Dtos;
using CropMarket.Application.Features.Orders.Requests;
using CropMarket.Application.Features.Orders.Results;

namespace CropMarket.Application.Features.Orders;

public interface IOrderService
{
    Task<CreateOrderResult> CreateAsync(int consumerId, CreateOrderRequest request);
    Task<List<MyOrderDto>> GetMineAsync(int consumerId);
    Task<List<ReceivedOrderDto>> GetReceivedAsync(int farmerId);
    Task<UpdateOrderStatusResult> UpdateStatusAsync(int farmerId, int orderId, UpdateOrderStatusRequest request);
}
