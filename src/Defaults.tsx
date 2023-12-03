import {AnimatePresence, AnimationProps, motion} from "framer-motion";
import {FC, forwardRef, PropsWithChildren, useId, useRef} from "react";
import {useNotification} from "./NotificationProvider.tsx";

const style = (
	<style
		children="
			.progress-361 {
				grid-column-end: span 2;
				transform: translateY(.5ch);
			}

			.message-361 {
				min-width: 0;
				text-overflow: ellipsis;
				overflow: clip;
				hyphens: auto;
			}

			.item-361 {
				background: white;
				border: 1px solid black;
				border-radius: 3px;
				padding: 1ch;
				display: grid;
				column-gap: 1ch;
				grid-template-columns: 1fr min-content;
				grid-template-rows: 1fr min-content;
				align-items: center;
			}

			.list-361 {
				position: fixed;
				right: 1ch;
				bottom: 1ch;
				display: flex;
				gap: 1ch;
				flex-direction: column;
				width: 32ch;
			}
		"
	/>
);

/** The default notification list. */
const NotificationRegion: FC<PropsWithChildren> = (props) => (
	<>
		{style}
		<div
			role="region"
			tabIndex={-1}
			aria-label="notifications"
			className="list-361"
		>
			<AnimatePresence>{props.children}</AnimatePresence>
		</div>
	</>
);

const notificationAnimationProps: AnimationProps = {
	initial: {x: 360},
	animate: {x: 0},
	exit: {x: 360},
};

/** The default notification. */
const Notification: FC<PropsWithChildren> = forwardRef<
	HTMLDivElement,
	PropsWithChildren
>((props, ref) => {
	const messageId = useId();

	const progressElementRef = useRef<HTMLProgressElement>(null);
	const {timeout, onPressClose} = useNotification((time) => {
		if (progressElementRef.current) {
			progressElementRef.current.value = time;
		}
	});

	return (
		<motion.div
			layout
			ref={ref}
			role="alert"
			aria-labelledby={messageId}
			className="item-361"
			{...notificationAnimationProps}
		>
			<div id={messageId} className="message-361">
				{props.children}
			</div>
			<button aria-label="close" onClick={onPressClose}>
				&#10005;
			</button>
			<progress
				hidden={timeout == null}
				ref={progressElementRef}
				max={timeout}
				className="progress-361"
			/>
		</motion.div>
	);
});

Notification.displayName = "Notification";

export {NotificationRegion, Notification};
