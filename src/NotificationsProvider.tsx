import {
	createContext,
	FC,
	PropsWithChildren,
	ReactNode,
	RefAttributes,
	useContext,
	useMemo,
	useState,
} from "react";
import invariant from "./Invariant.ts";
import NotificationProvider from "./NotificationProvider.tsx";
import noop from "./noop.ts";
import * as Defaults from "./Defaults.tsx";

/** Destroys an associated notification. */
type Destructor = (reason?: string) => void;

/** Optional settings that may be provided with a notification. */
interface NotifyOptions {
	/**
	 * Duration in milliseconds after which the notification will automatically
	 * be destroyed. "none" will disable the timeout. "inherit", `undefined` and
	 * `null` will apply the general timeout.
	 */
	timeout?: number | "none" | "inherit";
}

/** Basic notification API users interact with to push and manage notifications. */
interface Notifier {
	/**
	 * Pushes a notification.
	 *
	 * @param message - Any given user message
	 * @param options - Optional settings
	 * @returns A procedure with which you may programmatically destroy the
	 *   notification
	 */
	notify(message: ReactNode, options?: NotifyOptions): Destructor;
}

const context = createContext<Notifier | null>(null);

/**
 * Returns the notifier with which you may push notifications to the
 * notification region.
 *
 * @returns The notifier
 */
export function useNotifier(): Notifier {
	const notifier = useContext(context);
	invariant(notifier);
	return notifier;
}

// TODO(BW): Should "timeout" and "limit" accept "none"?
// TODO(BW): Maybe you should provide inline examples for the components.
/** Props that may be provided to the {@link NotificationsProvider}. */
interface NotificationsProviderProps {
	/**
	 * Specifies a duration in milliseconds after which notifications will
	 * automatically be destroyed. timeout.
	 */
	timeout?: number;
	/**
	 * Specifies the maximum number of notifications to be presented at the same
	 * time.
	 */
	limit?: number;
	/**
	 * A procedure that will be called when the notification unmounts.
	 *
	 * @param reason - A reason that may be provided for the destruction of the
	 *   notification
	 */
	onClose?: (reason?: string) => void;
	/**
	 * A custom notification region component. See
	 * {@link Defaults.NotificationRegion} for a complete example.
	 */
	NotificationRegion?: FC;
	/**
	 * A custom notification component. See {@link Defaults.Notification} for a
	 * complete example.
	 */
	Notification?: FC<PropsWithChildren & RefAttributes<unknown>>;
}

/**
 * Provider required for users to push notifications and to present them within
 * the notification region.
 */
const NotificationsProvider: FC<
	PropsWithChildren<NotificationsProviderProps>
> = (props) => {
	const timeout = props.timeout ?? 16_000;
	const limit = props.limit ?? 4;
	const onClose = props.onClose ?? noop;
	const Notification = props.Notification ?? Defaults.Notification;
	const NotificationRegion =
		props.NotificationRegion ?? Defaults.NotificationRegion;

	const [store, setStore] = useState<ReactNode[]>([]);

	const notifier = useMemo<Notifier>(
		() => ({
			notify(message, options) {
				const onUnmount = () => onClose(reason);
				const onPressClose = () => closeSelf("user");
				const onTimeout = () => closeSelf("timeout");

				const notification = (
					<NotificationProvider
						key={crypto.randomUUID()}
						onPressClose={onPressClose}
						onTimeout={onTimeout}
						onUnmount={onUnmount}
						timeout={merge(timeout, options?.timeout)}
						Component={Notification}
					>
						{message}
					</NotificationProvider>
				);

				let reason: string | undefined = "full";
				const closeSelf: Destructor = (reason_) => {
					reason = reason_;
					setStore((s) => s.filter((x) => x !== notification));
				};

				setStore((s) => [notification, ...s.slice(0, limit - 1)]);

				return closeSelf;
			},
		}),
		[Notification, limit, onClose, timeout],
	);

	return (
		<context.Provider value={notifier}>
			{props.children}
			<NotificationRegion>{store}</NotificationRegion>
		</context.Provider>
	);
};

export default NotificationsProvider;

/**
 * Merges a general setting with a setting for a specific instance.
 *
 * @param general - The general setting that may be inherited from
 * @param specific - The setting applied to this specific instance
 * @returns The resulting ("winning") setting
 */
function merge<T>(
	general: T | undefined,
	specific: T | "none" | "inherit" | undefined,
): T | undefined {
	if (specific === "inherit" || specific == null) return general;
	if (specific === "none") return undefined;
	return specific;
}
