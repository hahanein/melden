Robust headless React notifications.

![Notifications in action](https://github.com/hahanein/melden/raw/main/recording.webp)

# Example

```tsx
import {FC} from "react";
import {NotificationsProvider, useNotifier} from "melden";

const HelloWorldButton: FC = () => {
	const {notify} = useNotifier();
	const handleClick = () => notify("Hello world!");
	return <button onClick={handleClick}>Push notification</button>;
};

const App: FC = () => (
	<NotificationsProvider>
		<HelloWorldButton />
	</NotificationsProvider>
);
```
