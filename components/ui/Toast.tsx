type ToastProps = {
  message: string;
};

export function Toast({ message }: ToastProps) {
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 rounded-sm border border-lane bg-asphalt-raised px-4 py-2 text-sm text-chalk shadow-lg"
    >
      {message}
    </div>
  );
}
