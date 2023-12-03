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
import Default from "./Default.tsx";

type Destructor = (reason?: string) => void;

interface NotifyOptions {
	persistent?: boolean;
}

interface Notifier {
	notify(message: ReactNode, options?: NotifyOptions): Destructor;
}

const context = createContext<Notifier | null>(null);

export function useNotifier(): Notifier {
	const notifier = useContext(context);
	invariant(notifier);
	return notifier;
}

interface NotificationsProviderProps {
	timeout?: number;
	limit?: number;
	onClose?: (reason?: string) => void;
	List?: FC;
	Item?: FC<PropsWithChildren & RefAttributes<unknown>>;
}

const NotificationsProvider: FC<
	PropsWithChildren<NotificationsProviderProps>
> = (props) => {
	const timeout = props.timeout ?? 16_000;
	const limit = props.limit ?? 4;
	const onClose = props.onClose ?? noop;
	const List = props.List ?? Default;
	const Item = props.Item ?? Default.Item;

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
						timeout={options?.persistent ? undefined : timeout}
						Component={Item}
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
		[Item, limit, onClose, timeout],
	);

	return (
		<context.Provider value={notifier}>
			{props.children}
			<List>{store}</List>
		</context.Provider>
	);
};

export default NotificationsProvider;
