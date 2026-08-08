import { Component, type ErrorInfo, type ReactNode } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[300px] w-full flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-amber-950/40 border border-amber-500/30 rounded-2xl p-6 max-w-md w-full backdrop-blur-sm shadow-xl flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-slate-100">
                เกิดข้อผิดพลาดในการโหลดหน้าเว็บ
              </h3>
              <p className="text-xs text-slate-400">
                ระบบอาจมีการอัปเดตเวอร์ชันใหม่ กรุณากดปุ่มด้านล่างเพื่อโหลดหน้าเว็บใหม่อีกครั้ง
              </p>
            </div>

            <button
              onClick={this.handleReload}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-amber-200 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              โหลดหน้าเว็บใหม่
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
