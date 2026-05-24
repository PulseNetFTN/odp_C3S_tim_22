/**
 * Debounce utility for managing API calls
 */
export function debounce<TArgs extends unknown[], TReturn>(
    func: (...args: TArgs) => TReturn | Promise<TReturn>,
    wait: number
): (...args: TArgs) => void {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    return function executedFunction(...args: TArgs) {
        const later = () => {
            timeoutId = null;
            func(...args);
        };

        if (timeoutId !== null) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(later, wait);
    };
}

/**
 * Throttle utility for managing rapid API calls
 */
export function throttle<TArgs extends unknown[], TReturn>(
    func: (...args: TArgs) => TReturn | Promise<TReturn>,
    limit: number
): (...args: TArgs) => void {
    let inThrottle: boolean = false;

    return function executedFunction(...args: TArgs) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
