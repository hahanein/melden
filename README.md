Robust headless React notifications.

![Notifications in action](https://github.com/hahanein/melden/raw/main/recording.webp)

## Quickstart guide

`melden` is designed for you to bring your own notification component.
However, by default `melden` uses a bare-bones notification component animated with [Framer Motion](https://www.framer.com/motion/).

All you have to do is import `NotificationsProvider` to start pushing notifications.

```tsx
import {FC} from "react";
import {NotificationsProvider, useNotifier} from "melden";

/** A button which will push a "Hello world!" notification on click. */
const HelloWorldButton: FC = () => {
	const {notify} = useNotifier();
	const handleClick = () => notify("Hello world!");
	return <button onClick={handleClick}>Push notification</button>;
};

/** Our application allows you to push and interact with notifications. */
const App: FC = () => (
	<NotificationsProvider>
		<HelloWorldButton />
	</NotificationsProvider>
);
```
