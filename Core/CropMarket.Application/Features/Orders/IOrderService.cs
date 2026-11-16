using CropMarket.Application.Features.Orders.Dtos;
using CropMarket.Application.Features.Orders.Requests;
using CropMarket.Application.Features.Orders.Results;

namespace CropMarket.Application.Features.Orders;

public interface IOrderService
{
    // Consumer
    Task<CreateOrderResult> CreateAsync(int consumerId, CreateOrderRequest request);
    Task<List<MyOrderDto>> GetMineAsync(int consumerId);
    Task<UpdateOrderResult> UpdateAsync(int consumerId, int orderId, UpdateOrderRequest request);
    Task<CancelOrderResult> CancelAsync(int consumerId, int orderId);

    // Farmer
    Task<List<ReceivedOrderDto>> GetReceivedAsync(int farmerId);
    Task<UpdateOrderStatusResult> UpdateStatusAsync(int farmerId, int orderId, UpdateOrderStatusRequest request);
    Task<int> GetUnseenCountAsync(int farmerId);
    Task<List<ReceivedOrderDto>> GetUnseenAsync(int farmerId);
    Task MarkSeenAsync(int farmerId);
}