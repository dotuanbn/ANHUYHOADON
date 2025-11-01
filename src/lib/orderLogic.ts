// Smart order logic and workflow automation

import { Order, OrderStatus, OrderNote } from '@/types';
import { updateOrder, getOrderById, updateCustomerStats } from './storage';

export type StatusTransition = {
  from: OrderStatus;
  to: OrderStatus;
  label: string;
  icon?: string;
  color?: string;
  requires?: (order: Order) => boolean;
  autoActions?: (order: Order) => Partial<Order>;
};

export const STATUS_TRANSITIONS: Record<OrderStatus, StatusTransition[]> = {
  new: [
    {
      from: 'new',
      to: 'confirmed',
      label: 'Xác nhận đơn',
      color: 'bg-purple-600 hover:bg-purple-700',
      autoActions: (order) => ({
        notes: [
          ...order.notes,
          {
            id: Date.now().toString(),
            type: 'internal',
            content: `Đơn hàng đã được xác nhận lúc ${new Date().toLocaleString('vi-VN')}`,
            createdBy: 'Hệ thống',
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    },
    {
      from: 'new',
      to: 'processing',
      label: 'Bắt đầu xử lý',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      autoActions: (order) => ({
        notes: [
          ...order.notes,
          {
            id: Date.now().toString(),
            type: 'internal',
            content: `Bắt đầu xử lý đơn hàng lúc ${new Date().toLocaleString('vi-VN')}`,
            createdBy: 'Hệ thống',
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    },
    {
      from: 'new',
      to: 'cancelled',
      label: 'Hủy đơn',
      color: 'bg-red-600 hover:bg-red-700',
      requires: (order) => order.payment.paid === 0,
      autoActions: (order) => ({
        notes: [
          ...order.notes,
          {
            id: Date.now().toString(),
            type: 'internal',
            content: `Đơn hàng đã bị hủy lúc ${new Date().toLocaleString('vi-VN')}`,
            createdBy: 'Hệ thống',
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    },
  ],
  confirmed: [
    {
      from: 'confirmed',
      to: 'processing',
      label: 'Bắt đầu xử lý',
      color: 'bg-yellow-600 hover:bg-yellow-700',
      autoActions: (order) => ({
        notes: [
          ...order.notes,
          {
            id: Date.now().toString(),
            type: 'internal',
            content: `Bắt đầu xử lý đơn hàng lúc ${new Date().toLocaleString('vi-VN')}`,
            createdBy: 'Hệ thống',
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    },
    {
      from: 'confirmed',
      to: 'cancelled',
      label: 'Hủy đơn',
      color: 'bg-red-600 hover:bg-red-700',
      requires: (order) => order.payment.paid === 0,
    },
  ],
  processing: [
    {
      from: 'processing',
      to: 'shipping',
      label: 'Chuyển giao hàng',
      color: 'bg-orange-600 hover:bg-orange-700',
      requires: (order) => order.items.length > 0,
      autoActions: (order) => ({
        notes: [
          ...order.notes,
          {
            id: Date.now().toString(),
            type: 'internal',
            content: `Đơn hàng đã được chuyển cho đơn vị vận chuyển lúc ${new Date().toLocaleString('vi-VN')}`,
            createdBy: 'Hệ thống',
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    },
    {
      from: 'processing',
      to: 'cancelled',
      label: 'Hủy đơn',
      color: 'bg-red-600 hover:bg-red-700',
      requires: (order) => order.payment.paid < order.payment.finalAmount * 0.5,
    },
  ],
  shipping: [
    {
      from: 'shipping',
      to: 'delivered',
      label: 'Đã giao hàng',
      color: 'bg-green-600 hover:bg-green-700',
      autoActions: (order) => {
        const now = new Date().toISOString();
        return {
          notes: [
            ...order.notes,
            {
              id: Date.now().toString(),
              type: 'internal',
              content: `Đơn hàng đã được giao thành công lúc ${new Date().toLocaleString('vi-VN')}`,
              createdBy: 'Hệ thống',
              createdAt: now,
            },
          ],
        };
      },
    },
    {
      from: 'shipping',
      to: 'returned',
      label: 'Trả hàng',
      color: 'bg-gray-600 hover:bg-gray-700',
      autoActions: (order) => ({
        notes: [
          ...order.notes,
          {
            id: Date.now().toString(),
            type: 'internal',
            content: `Đơn hàng đã được trả lại lúc ${new Date().toLocaleString('vi-VN')}`,
            createdBy: 'Hệ thống',
            createdAt: new Date().toISOString(),
          },
        ],
      }),
    },
  ],
  delivered: [
    {
      from: 'delivered',
      to: 'returned',
      label: 'Trả hàng',
      color: 'bg-gray-600 hover:bg-gray-700',
      requires: (order) => {
        const deliveredDate = new Date(order.updatedAt);
        const daysSinceDelivery = (Date.now() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceDelivery <= 7;
      },
    },
  ],
  cancelled: [],
  returned: [],
};

export const getAvailableTransitions = (order: Order): StatusTransition[] => {
  const transitions = STATUS_TRANSITIONS[order.status] || [];
  
  return transitions.filter((transition) => {
    if (transition.requires) {
      return transition.requires(order);
    }
    return true;
  });
};

export const transitionOrderStatus = (
  orderId: string,
  newStatus: OrderStatus,
  additionalUpdates?: Partial<Order>
): { success: boolean; message: string; updatedOrder?: Order } => {
  const order = getOrderById(orderId);
  
  if (!order) {
    return {
      success: false,
      message: 'Không tìm thấy đơn hàng',
    };
  }

  const availableTransitions = getAvailableTransitions(order);
  const transition = availableTransitions.find((t) => t.to === newStatus);

  if (!transition) {
    return {
      success: false,
      message: `Không thể chuyển từ trạng thái "${getStatusLabel(order.status)}" sang "${getStatusLabel(newStatus)}"`,
    };
  }

  if (transition.requires && !transition.requires(order)) {
    return {
      success: false,
      message: 'Không đủ điều kiện để thực hiện chuyển đổi trạng thái này',
    };
  }

  const autoUpdates = transition.autoActions ? transition.autoActions(order) : {};
  const updates: Partial<Order> = {
    status: newStatus,
    updatedAt: new Date().toISOString(),
    ...autoUpdates,
    ...additionalUpdates,
  };

  updateOrder(orderId, updates);
  updateCustomerStats(order.customerId);

  const updatedOrder = getOrderById(orderId);

  return {
    success: true,
    message: `Đã chuyển đơn hàng sang trạng thái "${getStatusLabel(newStatus)}"`,
    updatedOrder: updatedOrder || undefined,
  };
};

export const getStatusLabel = (status: OrderStatus): string => {
  const labels: Record<OrderStatus, string> = {
    new: 'Mới',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipping: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    returned: 'Trả hàng',
  };
  return labels[status] || status;
};

export const getStatusColor = (status: OrderStatus): string => {
  const colors: Record<OrderStatus, string> = {
    new: 'bg-blue-100 text-blue-800 border-blue-200',
    confirmed: 'bg-purple-100 text-purple-800 border-purple-200',
    processing: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    shipping: 'bg-orange-100 text-orange-800 border-orange-200',
    delivered: 'bg-green-100 text-green-800 border-green-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
    returned: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const canCancelOrder = (order: Order): boolean => {
  if (order.status === 'cancelled' || order.status === 'delivered') {
    return false;
  }
  
  if (order.status === 'shipping') {
    return false;
  }

  const paidPercentage = (order.payment.paid / order.payment.finalAmount) * 100;
  return paidPercentage < 50;
};

export const shouldAutoConfirm = (order: Order): boolean => {
  if (order.status !== 'new') {
    return false;
  }

  const hoursSinceCreated = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
  return hoursSinceCreated >= 24 && order.payment.paid >= order.payment.finalAmount * 0.3;
};

export const calculateOrderHealth = (order: Order): {
  score: number;
  issues: string[];
  suggestions: string[];
} => {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  if (!order.customerName || !order.customerPhone) {
    issues.push('Thiếu thông tin khách hàng');
    score -= 20;
  }

  if (order.items.length === 0) {
    issues.push('Đơn hàng không có sản phẩm');
    score -= 30;
  }

  if (order.payment.remaining > 0 && order.status === 'delivered') {
    issues.push('Đơn hàng đã giao nhưng còn nợ');
    score -= 15;
    suggestions.push('Nên thu tiền còn lại hoặc ghi chú vào đơn');
  }

  if (order.status === 'new' && order.payment.paid === 0) {
    suggestions.push('Nên thu tiền cọc hoặc xác nhận đơn hàng');
  }

  if (order.status === 'processing' && !order.shipping.trackingNumber && order.shipping.province) {
    suggestions.push('Nên nhập mã vận đơn khi chuyển sang trạng thái "Đang giao"');
  }

  if (order.status === 'shipping' && !order.shipping.estimatedDeliveryDate) {
    suggestions.push('Nên cập nhật ngày giao hàng dự kiến');
  }

  if (order.items.some(item => item.price <= 0)) {
    issues.push('Có sản phẩm có giá bằng 0');
    score -= 10;
  }

  return {
    score: Math.max(0, score),
    issues,
    suggestions,
  };
};

export const autoSuggestNextAction = (order: Order): string | null => {
  if (order.status === 'new' && order.payment.paid > 0) {
    return 'Xác nhận đơn hàng';
  }

  if (order.status === 'confirmed' && order.items.length > 0) {
    return 'Bắt đầu xử lý đơn hàng';
  }

  if (order.status === 'processing' && order.items.every(item => item.quantity > 0)) {
    return 'Chuyển sang trạng thái "Đang giao"';
  }

  if (order.status === 'shipping' && order.shipping.trackingNumber) {
    return 'Xác nhận đã giao hàng';
  }

  if (order.status === 'delivered' && order.payment.remaining > 0) {
    return 'Cập nhật thông tin thanh toán';
  }

  return null;
};

