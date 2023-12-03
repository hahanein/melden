import NotificationsProvider, {useNotifier} from "./NotificationsProvider.tsx";
import {
	FC,
	FormEventHandler,
	memo,
	useCallback,
	useId,
	useRef,
	useState,
} from "react";
import invariant from "./Invariant.ts";

const style = (
	<style
		children="
			.test-form-361 > fieldset {
				display: flex;
				flex-direction: column;
				gap: 3px;
				align-items: flex-start;
			}
		"
	/>
);

const AppImpl: FC<{
	defaultTimeout?: number;
	defaultLimit?: number;
	onSubmitSettings?: FormEventHandler<HTMLFormElement>;
}> = memo((props) => {
	const settingsId = useId();
	const notificationId = useId();
	const messageRef = useRef<HTMLInputElement>(null);
	const {notify} = useNotifier();
	const handleSubmitNotification: FormEventHandler<HTMLFormElement> =
		useCallback(
			(event) => {
				event.preventDefault();

				const data = new FormData(event.currentTarget);
				const message = data.get("message");
				invariant(typeof message === "string");
				const persistent = data.has("persistent");

				const input = messageRef.current;
				invariant(input);
				input.value = "";

				notify(message, {persistent});
			},
			[notify],
		);

	return (
		<>
			{style}
			<form
				aria-labelledby={settingsId}
				className="test-form-361"
				onSubmit={props.onSubmitSettings}
			>
				<fieldset>
					<legend id={settingsId}>Settings</legend>
					<label>
						Timeout:&nbsp;
						<input
							name="timeout"
							type="number"
							defaultValue={props.defaultTimeout}
						/>
					</label>
					<br />
					<label>
						Limit:&nbsp;
						<input
							name="limit"
							type="number"
							defaultValue={props.defaultLimit}
						/>
					</label>
					<br />
					<button>Save</button>
				</fieldset>
			</form>
			<br />
			<form
				aria-labelledby={notificationId}
				className="test-form-361"
				onSubmit={handleSubmitNotification}
			>
				<fieldset>
					<legend id={notificationId}>Notification</legend>
					<label>
						<input type="checkbox" name="persistent" />
						&nbsp;Persistent
					</label>
					<div>
						<input ref={messageRef} name="message" />
						&nbsp;
						<button>Push</button>
					</div>
				</fieldset>
			</form>
		</>
	);
});

const handleClose: (reason?: string) => void = (reason) =>
	console.log("NotificationProvider closed:", reason);

const defaultTimeout = 16_000;
const defaultLimit = 4;

const App: FC = () => {
	const [timeout, setTimeout] = useState<number>(defaultTimeout);
	const [limit, setLimit] = useState<number>(defaultLimit);
	const handleSubmitSettings: FormEventHandler<HTMLFormElement> = useCallback(
		(event) => {
			event.preventDefault();
			const data = new FormData(event.currentTarget);

			const timeout = data.get("timeout");
			invariant(typeof timeout === "string");
			setTimeout(parseInt(timeout));

			const limit = data.get("limit");
			invariant(typeof limit === "string");
			setLimit(parseInt(limit));
		},
		[],
	);

	return (
		<NotificationsProvider
			onClose={handleClose}
			timeout={timeout}
			limit={limit}
		>
			<AppImpl
				defaultTimeout={defaultTimeout}
				defaultLimit={defaultLimit}
				onSubmitSettings={handleSubmitSettings}
			/>
		</NotificationsProvider>
	);
};

export default App;
