import {
	createContext,
	FC,
	forwardRef,
	PropsWithChildren,
	RefAttributes,
	useContext,
	useEffect,
	useMemo,
	useRef,
} from "react";
import invariant from "./Invariant.ts";
import useEffectOnce from "./useEffectOnce.ts";

const context = createContext<NotificationContext | null>(null);

interface NotificationContext {
	onUnmount: VoidFunction;
	timeout?: number | undefined;
	onTimeout: VoidFunction;
	onPressClose: VoidFunction;
}

interface NotificationProviderProps extends NotificationContext {
	Component: FC<PropsWithChildren & RefAttributes<unknown>>;
}

const NotificationProvider = forwardRef<
	unknown,
	PropsWithChildren<NotificationProviderProps>
>((props, ref) => (
	<context.Provider
		value={{
			onUnmount: props.onUnmount,
			onPressClose: props.onPressClose,
			onTimeout: props.onTimeout,
			timeout: props.timeout,
		}}
	>
		<props.Component ref={ref}>{props.children}</props.Component>
	</context.Provider>
));

export function useNotification(onProgress: (time: number) => void): {
	timeout?: number | undefined;
	onPressClose: VoidFunction;
} {
	const notification = useContext(context);
	invariant(notification);

	const onUnmount = notification.onUnmount;
	const timeout = notification.timeout;
	const onTimeout = notification.onTimeout;
	const onPressClose = notification.onPressClose;
	const onProgressRef = useRef(onProgress);
	onProgressRef.current = onProgress;

	useEffectOnce(() => onUnmount);
	useEffect(() => {
		if (timeout == null) {
			return;
		}

		const end = timeout + performance.now();
		let handle = requestAnimationFrame(function callback(time) {
			if (end < time) {
				onTimeout();
			} else {
				onProgressRef.current(end - time);
				handle = requestAnimationFrame(callback);
			}
		});

		return () => cancelAnimationFrame(handle);
	}, [onTimeout, timeout]);

	return useMemo(() => ({timeout, onPressClose}), [onPressClose, timeout]);
}

export default NotificationProvider;
