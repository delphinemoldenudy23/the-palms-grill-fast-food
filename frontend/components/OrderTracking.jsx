import { FaClock, FaCheckCircle, FaUtensils, FaMotorcycle, FaBox, FaTimesCircle } from "react-icons/fa";

const statusConfig = {
  pending: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: FaClock,
  },
  confirmed: {
    label: "Confirmed",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: FaCheckCircle,
  },
  preparing: {
    label: "Preparing",
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: FaUtensils,
  },
  out_for_delivery: {
    label: "Out for Delivery",
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: FaMotorcycle,
  },
  delivered: {
    label: "Delivered",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: FaBox,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: FaTimesCircle,
  },
};

export default function OrderTracking({ order }) {
  const status = order.status || "pending";
  const config = statusConfig[status] || statusConfig.pending;
  const StatusIcon = config.icon;

  const statusSteps = [
    { key: "pending", label: "Pending" },
    { key: "confirmed", label: "Confirmed" },
    { key: "preparing", label: "Preparing" },
    { key: "out_for_delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
  ];

  const getCurrentStepIndex = () => {
    if (status === "cancelled") return -1;
    return statusSteps.findIndex((step) => step.key === status);
  };

  const currentStepIndex = getCurrentStepIndex();

  return (
    <div className="space-y-4">
      {/* Current Status Badge */}
      <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${config.color} font-semibold`}>
        <StatusIcon className="text-lg" />
        <span>{config.label}</span>
      </div>

      {/* Status Timeline */}
      {status !== "cancelled" && (
        <div className="relative">
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const Icon = isCompleted ? FaCheckCircle : FaClock;

              return (
                <div key={step.key} className="relative flex items-center gap-4 pl-2">
                  <div
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                        ? "bg-primary text-white"
                        : "bg-gray-200 text-gray-400"
                    }`}
                  >
                    <Icon className="text-sm" />
                  </div>
                  <span
                    className={`font-medium ${
                      isCompleted
                        ? "text-green-600"
                        : isCurrent
                        ? "text-primary font-semibold"
                        : "text-gray-400"
                    }`}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status History */}
      {order.statusHistory && order.statusHistory.length > 1 && (
        <div className="mt-6 pt-4 border-t">
          <h4 className="font-semibold text-gray-700 mb-2">Status History</h4>
          <div className="space-y-2 text-sm">
            {order.statusHistory.slice().reverse().map((history, index) => {
              const historyConfig = statusConfig[history.status] || statusConfig.pending;
              const HistoryIcon = historyConfig.icon;

              return (
                <div key={index} className="flex items-center gap-2 text-gray-600">
                  <HistoryIcon className="text-xs" />
                  <span className="font-medium">{historyConfig.label}</span>
                  <span className="text-gray-400">
                    - {new Date(history.timestamp).toLocaleString()}
                  </span>
                  {history.note && <span className="text-gray-500 italic">({history.note})</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
