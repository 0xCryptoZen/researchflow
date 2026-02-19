import { toast } from 'sonner';

/**
 * Toast 通知工具函数
 * 提供统一的消息提示体验
 */

// 成功提示
export const toastSuccess = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
  });
};

// 错误提示
export const toastError = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: 4000,
  });
};

// 警告提示
export const toastWarning = (message: string, description?: string) => {
  toast.warning(message, {
    description,
    duration: 3500,
  });
};

// 信息提示
export const toastInfo = (message: string, description?: string) => {
  toast.info(message, {
    description,
    duration: 3000,
  });
};

// 加载中提示
export const toastLoading = (message: string) => {
  return toast.loading(message);
};

// 通用 Promise 提示
export const toastPromise = async <T,>(
  promise: Promise<T>,
  loadingMessage: string,
  successMessage: string,
  errorMessage?: string
): Promise<T> => {
  const id = toast.loading(loadingMessage);
  try {
    const result = await promise;
    toast.success(successMessage, { id });
    return result;
  } catch (error) {
    toast.error(errorMessage || '操作失败', { id });
    throw error;
  }
};

// 自定义提示
export const toastCustom = (
  message: string,
  options?: {
    description?: string;
    duration?: number;
    icon?: React.ReactNode;
  }
) => {
  toast(message, options);
};

export { toast };
