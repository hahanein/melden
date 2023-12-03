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

/** Settings and procedures required for integrating notifications. */
interface NotificationContext {
	/** Procedure to be called when the notification unmounts. */
	onUnmount: VoidFunction;
	/**
	 * Duration in milliseconds after which the notification will automatically
	 * be destroyed.
	 */
	timeout?: number;
	/** Procedure to be called when the timeout has been reached. */
	onTimeout: VoidFunction;
	/**
	 * Procedure to be called when the user has requested to close the
	 * notification.
	 */
	onPressClose: VoidFunction;
}

/** Props to be provided to every {@link NotificationProvider}. */
interface NotificationProviderProps extends NotificationContext {
	/** A user-defined component for presenting notifications. */
	Component: FC<PropsWithChildren & RefAttributes<unknown>>;
}

/**
 * Provides user-defined notifications with the required information and
 * functionality to manage and monitor the life-cycle of a notification.
 */
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

/**
 * A hook with which notification components may be built that will integrate
 * with our system.
 *
 * @param onProgress - A procedure with which you may monitor the progress of
 *   the timeout after which the notification will automatically be destroyed
 * @returns Information and functionality with which notification components may
 *   be enriched
 */
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
